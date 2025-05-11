import { supabaseClient } from '../../../services/supabase/client';
import {
  Appointment,
  AppointmentFilters,
  AppointmentStatus,
  AvailabilityResult,
  CreateAppointmentInput,
  TimeSlot,
  UpdateAppointmentInput
} from '../domain/types';
import {
  AVAILABLE_TIME_SLOTS,
  BUSINESS_DAYS,
  DEFAULT_APPOINTMENT_DURATION,
  DEFAULT_APPOINTMENT_PRIORITY,
  DEFAULT_APPOINTMENT_STATUS,
  MAX_APPOINTMENTS_PER_TECHNICIAN
} from '../domain/constants';

// Additional types for database responses
interface AppointmentWithRelations {
  [key: string]: any;
  customer?: any;
  order?: any;
  technician?: any;
}

/**
 * Repository for appointment data operations
 */
export const appointmentRepository = {
  /**
   * Get all appointments with optional filtering and pagination
   */
  async getAppointments(
    filters?: AppointmentFilters,
    page: number = 1,
    pageSize: number = 20,
    includeCustomer: boolean = false,
    includeOrder: boolean = false,
    includeTechnician: boolean = false
  ): Promise<{ appointments: Appointment[]; totalCount: number }> {
    try {
      // Build select query with optional relations
      let selectQuery = '*';
      if (includeCustomer) {
        selectQuery += ', customer:customer_id(*)';
      }
      if (includeOrder) {
        selectQuery += ', order:order_id(*)';
      }
      if (includeTechnician) {
        selectQuery += ', technician:technician_id(*)';
      }

      // Initial query builder
      let query = supabaseClient
        .from('appointments')
        .select(selectQuery, { count: 'exact' });

      // Apply filters if provided
      if (filters) {
        if (filters.customer_id) {
          query = query.eq('customer_id', filters.customer_id);
        }

        if (filters.technician_id) {
          query = query.eq('technician_id', filters.technician_id);
        }

        if (filters.order_id) {
          query = query.eq('order_id', filters.order_id);
        }

        if (filters.service_type) {
          if (Array.isArray(filters.service_type)) {
            query = query.in('service_type', filters.service_type);
          } else {
            query = query.eq('service_type', filters.service_type);
          }
        }

        if (filters.status) {
          if (Array.isArray(filters.status)) {
            query = query.in('status', filters.status);
          } else {
            query = query.eq('status', filters.status);
          }
        }

        if (filters.priority) {
          if (Array.isArray(filters.priority)) {
            query = query.in('priority', filters.priority);
          } else {
            query = query.eq('priority', filters.priority);
          }
        }

        if (filters.date_from) {
          query = query.gte('scheduled_date', filters.date_from.toISOString().split('T')[0]);
        }

        if (filters.date_to) {
          query = query.lte('scheduled_date', filters.date_to.toISOString().split('T')[0]);
        }

        if (filters.city) {
          query = query.ilike('city', `%${filters.city}%`);
        }

        if (filters.search) {
          query = query.or(
            `address.ilike.%${filters.search}%,city.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
          );
        }
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Order by scheduled_date and scheduled_time_slot
      query = query
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time_slot', { ascending: true })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Process the returned data to format appointments with their relations
      const appointments = (data || []).map(appointment => {
        const appointmentData = appointment as AppointmentWithRelations;
        const result: Appointment = {
          id: appointmentData.id,
          customer_id: appointmentData.customer_id,
          order_id: appointmentData.order_id,
          technician_id: appointmentData.technician_id,
          service_type: appointmentData.service_type,
          status: appointmentData.status,
          priority: appointmentData.priority,
          scheduled_date: new Date(appointmentData.scheduled_date),
          scheduled_time_slot: appointmentData.scheduled_time_slot,
          duration_minutes: appointmentData.duration_minutes,
          address: appointmentData.address,
          city: appointmentData.city,
          notes: appointmentData.notes,
          completion_notes: appointmentData.completion_notes,
          parts_used: appointmentData.parts_used,
          created_at: new Date(appointmentData.created_at),
          updated_at: new Date(appointmentData.updated_at),
          completed_at: appointmentData.completed_at ? new Date(appointmentData.completed_at) : undefined
        };
        
        if (includeCustomer && appointmentData.customer) {
          result.customer = appointmentData.customer;
        }
        
        if (includeOrder && appointmentData.order) {
          result.order = appointmentData.order;
        }
        
        if (includeTechnician && appointmentData.technician) {
          result.technician = appointmentData.technician;
        }
        
        return result;
      });

      return {
        appointments,
        totalCount: count || 0
      };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  /**
   * Get a single appointment by ID with options to include related data
   */
  async getAppointmentById(
    id: string,
    includeCustomer: boolean = false,
    includeOrder: boolean = false,
    includeTechnician: boolean = false
  ): Promise<Appointment | null> {
    try {
      // Build select query with optional relations
      let selectQuery = '*';
      
      if (includeCustomer) {
        selectQuery += ', customer:customer_id(*)';
      }
      
      if (includeOrder) {
        selectQuery += ', order:order_id(*)';
      }
      
      if (includeTechnician) {
        selectQuery += ', technician:technician_id(*)';
      }

      const { data, error } = await supabaseClient
        .from('appointments')
        .select(selectQuery)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Record not found
          return null;
        }
        throw error;
      }

      // Process the returned data to format appointment with its relations
      const appointmentData = data as AppointmentWithRelations;
      const appointment: Appointment = {
        id: appointmentData.id,
        customer_id: appointmentData.customer_id,
        order_id: appointmentData.order_id,
        technician_id: appointmentData.technician_id,
        service_type: appointmentData.service_type,
        status: appointmentData.status,
        priority: appointmentData.priority,
        scheduled_date: new Date(appointmentData.scheduled_date),
        scheduled_time_slot: appointmentData.scheduled_time_slot,
        duration_minutes: appointmentData.duration_minutes,
        address: appointmentData.address,
        city: appointmentData.city,
        notes: appointmentData.notes,
        completion_notes: appointmentData.completion_notes,
        parts_used: appointmentData.parts_used,
        created_at: new Date(appointmentData.created_at),
        updated_at: new Date(appointmentData.updated_at),
        completed_at: appointmentData.completed_at ? new Date(appointmentData.completed_at) : undefined
      };
      
      if (includeCustomer && appointmentData.customer) {
        appointment.customer = appointmentData.customer;
      }
      
      if (includeOrder && appointmentData.order) {
        appointment.order = appointmentData.order;
      }
      
      if (includeTechnician && appointmentData.technician) {
        appointment.technician = appointmentData.technician;
      }

      return appointment;
    } catch (error) {
      console.error(`Error fetching appointment with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new appointment
   */
  async createAppointment(appointmentData: CreateAppointmentInput): Promise<Appointment> {
    try {
      // Format scheduled_date for database
      const scheduledDate = appointmentData.scheduled_date instanceof Date
        ? appointmentData.scheduled_date.toISOString().split('T')[0]
        : new Date(appointmentData.scheduled_date).toISOString().split('T')[0];
      
      // Create appointment with defaults
      const appointmentWithDefaults = {
        customer_id: appointmentData.customer_id,
        order_id: appointmentData.order_id,
        technician_id: appointmentData.technician_id,
        service_type: appointmentData.service_type,
        status: appointmentData.status || DEFAULT_APPOINTMENT_STATUS,
        priority: appointmentData.priority || DEFAULT_APPOINTMENT_PRIORITY,
        scheduled_date: scheduledDate,
        scheduled_time_slot: appointmentData.scheduled_time_slot,
        duration_minutes: appointmentData.duration_minutes || DEFAULT_APPOINTMENT_DURATION,
        address: appointmentData.address,
        city: appointmentData.city,
        notes: appointmentData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient
        .from('appointments')
        .insert(appointmentWithDefaults)
        .select()
        .single();

      if (error) throw error;

      // Return the appointment with proper date handling
      return {
        ...data,
        scheduled_date: new Date(data.scheduled_date),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      } as Appointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  /**
   * Update an existing appointment
   */
  async updateAppointment(appointmentData: UpdateAppointmentInput): Promise<Appointment> {
    try {
      const updates: any = { ...appointmentData };
      
      // Remove id from updates
      delete updates.id;
      
      // Format dates for database
      if (updates.scheduled_date) {
        updates.scheduled_date = updates.scheduled_date instanceof Date
          ? updates.scheduled_date.toISOString().split('T')[0]
          : new Date(updates.scheduled_date).toISOString().split('T')[0];
      }
      
      if (updates.completed_at) {
        updates.completed_at = updates.completed_at instanceof Date
          ? updates.completed_at.toISOString()
          : new Date(updates.completed_at).toISOString();
      }
      
      // Add updated_at timestamp
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabaseClient
        .from('appointments')
        .update(updates)
        .eq('id', appointmentData.id)
        .select()
        .single();

      if (error) throw error;

      // Return the appointment with proper date handling
      return {
        ...data,
        scheduled_date: new Date(data.scheduled_date),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        completed_at: data.completed_at ? new Date(data.completed_at) : undefined
      } as Appointment;
    } catch (error) {
      console.error(`Error updating appointment with ID ${appointmentData.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an appointment by ID
   */
  async deleteAppointment(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error(`Error deleting appointment with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Check availability for a specific date
   */
  async checkAvailability(
    date: Date | string,
    technicianId?: string,
    excludeAppointmentId?: string
  ): Promise<AvailabilityResult> {
    try {
      // Format date for querying
      const dateString = date instanceof Date
        ? date.toISOString().split('T')[0]
        : new Date(date).toISOString().split('T')[0];
      
      // Get all appointments for this date
      let query = supabaseClient
        .from('appointments')
        .select('id, technician_id, scheduled_time_slot, status')
        .eq('scheduled_date', dateString);
      
      if (technicianId) {
        query = query.eq('technician_id', technicianId);
      }
      
      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
      }
      
      // Only consider non-cancelled appointments
      query = query.not('status', 'eq', AppointmentStatus.CANCELLED);
      
      const { data: existingAppointments, error } = await query;
      
      if (error) throw error;
      
      // Get all technicians for availability check
      const { data: technicians } = await supabaseClient
        .from('technicians')
        .select('id, active')
        .eq('active', true);
      
      // If specific technician requested, filter to just that one
      const availableTechnicians = technicianId 
        ? technicians?.filter(tech => tech.id === technicianId) || []
        : technicians || [];
      
      // Initialize all time slots as available
      const timeSlots: TimeSlot[] = AVAILABLE_TIME_SLOTS.map(slot => {
        const [start, end] = slot.split('-');
        return {
          start,
          end,
          available: true,
          technician_id: undefined
        };
      });
      
      // Check if date is a business day
      const dateObj = new Date(dateString);
      const isBusinessDay = BUSINESS_DAYS.includes(dateObj.getDay());
      
      if (!isBusinessDay) {
        // Mark all slots as unavailable if not a business day
        timeSlots.forEach(slot => {
          slot.available = false;
        });
        
        return {
          date: dateString,
          time_slots: timeSlots
        };
      }
      
      // Process existing appointments
      for (const slot of timeSlots) {
        // Count appointments by technician for this time slot
        const technicianAppointmentCounts: Record<string, number> = {};
        
        for (const appt of existingAppointments || []) {
          if (appt.scheduled_time_slot === `${slot.start}-${slot.end}`) {
            if (appt.technician_id) {
              technicianAppointmentCounts[appt.technician_id] = (technicianAppointmentCounts[appt.technician_id] || 0) + 1;
            }
          }
        }
        
        // Find an available technician for this slot
        let availableTechnician = undefined;
        
        for (const tech of availableTechnicians) {
          const count = technicianAppointmentCounts[tech.id] || 0;
          if (count < MAX_APPOINTMENTS_PER_TECHNICIAN) {
            availableTechnician = tech.id;
            break;
          }
        }
        
        slot.available = !!availableTechnician;
        slot.technician_id = availableTechnician;
      }
      
      return {
        date: dateString,
        time_slots: timeSlots
      };
    } catch (error) {
      console.error('Error checking appointment availability:', error);
      throw error;
    }
  },

  /**
   * Get appointments for a specific day
   */
  async getAppointmentsByDay(
    date: Date | string,
    technicianId?: string
  ): Promise<Appointment[]> {
    try {
      // Format date for querying
      const dateString = date instanceof Date
        ? date.toISOString().split('T')[0]
        : new Date(date).toISOString().split('T')[0];
      
      // Build query
      let query = supabaseClient
        .from('appointments')
        .select('*')
        .eq('scheduled_date', dateString);
      
      if (technicianId) {
        query = query.eq('technician_id', technicianId);
      }
      
      const { data, error } = await query.order('scheduled_time_slot');
      
      if (error) throw error;
      
      // Process appointments with proper date handling
      return (data || []).map(appointment => ({
        ...appointment,
        scheduled_date: new Date(appointment.scheduled_date),
        created_at: new Date(appointment.created_at),
        updated_at: new Date(appointment.updated_at),
        completed_at: appointment.completed_at ? new Date(appointment.completed_at) : undefined
      })) as Appointment[];
    } catch (error) {
      console.error('Error fetching appointments by day:', error);
      throw error;
    }
  },

  /**
   * Get a count of appointments by status
   */
  async getAppointmentCountByStatus(): Promise<Record<AppointmentStatus, number>> {
    try {
      const { data, error } = await supabaseClient
        .from('appointments')
        .select('status');
      
      if (error) throw error;
      
      const statusCounts: Record<AppointmentStatus, number> = {
        [AppointmentStatus.SCHEDULED]: 0,
        [AppointmentStatus.CONFIRMED]: 0,
        [AppointmentStatus.IN_PROGRESS]: 0,
        [AppointmentStatus.COMPLETED]: 0,
        [AppointmentStatus.CANCELLED]: 0,
        [AppointmentStatus.NO_SHOW]: 0
      };
      
      (data || []).forEach(appointment => {
        statusCounts[appointment.status as AppointmentStatus]++;
      });
      
      return statusCounts;
    } catch (error) {
      console.error('Error getting appointment count by status:', error);
      throw error;
    }
  }
}; 