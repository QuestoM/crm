/**
 * Appointment status values
 */
export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

/**
 * Service type values
 */
export enum ServiceType {
  INSTALLATION = 'installation',
  MAINTENANCE = 'maintenance',
  REPAIR = 'repair',
  REPLACEMENT = 'replacement',
  INSPECTION = 'inspection',
  CONSULTATION = 'consultation'
}

/**
 * Appointment priority levels
 */
export enum AppointmentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * Represents a service appointment in the system
 */
export interface Appointment {
  id: string;
  customer_id: string;
  order_id?: string;
  technician_id?: string;
  service_type: ServiceType;
  status: AppointmentStatus;
  priority: AppointmentPriority;
  scheduled_date: Date;
  scheduled_time_slot: string; // Format: "HH:MM-HH:MM" e.g., "09:00-11:00"
  duration_minutes: number;
  address: string;
  city: string;
  notes?: string;
  completion_notes?: string;
  parts_used?: string[];
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  customer?: any; // Customer details when included
  order?: any; // Order details when included
  technician?: any; // Technician details when included
}

/**
 * Represents input data for creating a new appointment
 */
export interface CreateAppointmentInput {
  customer_id: string;
  order_id?: string;
  technician_id?: string;
  service_type: ServiceType;
  status?: AppointmentStatus;
  priority?: AppointmentPriority;
  scheduled_date: Date | string;
  scheduled_time_slot: string;
  duration_minutes?: number;
  address: string;
  city: string;
  notes?: string;
}

/**
 * Represents input data for updating an appointment
 */
export interface UpdateAppointmentInput {
  id: string;
  technician_id?: string;
  service_type?: ServiceType;
  status?: AppointmentStatus;
  priority?: AppointmentPriority;
  scheduled_date?: Date | string;
  scheduled_time_slot?: string;
  duration_minutes?: number;
  address?: string;
  city?: string;
  notes?: string;
  completion_notes?: string;
  parts_used?: string[];
  completed_at?: Date | string;
}

/**
 * Represents input data for scheduling availability
 */
export interface AvailabilityCheckInput {
  date: Date | string;
  service_type?: ServiceType;
  technician_id?: string;
  duration_minutes?: number;
}

/**
 * Represents a time slot available for scheduling
 */
export interface TimeSlot {
  start: string; // Format: "HH:MM" e.g., "09:00"
  end: string; // Format: "HH:MM" e.g., "11:00"
  available: boolean;
  technician_id?: string;
}

/**
 * Represents an availability result
 */
export interface AvailabilityResult {
  date: string;
  time_slots: TimeSlot[];
}

/**
 * Appointment filtering options
 */
export interface AppointmentFilters {
  customer_id?: string;
  technician_id?: string;
  order_id?: string;
  service_type?: ServiceType | ServiceType[];
  status?: AppointmentStatus | AppointmentStatus[];
  priority?: AppointmentPriority | AppointmentPriority[];
  date_from?: Date;
  date_to?: Date;
  city?: string;
  search?: string;
}