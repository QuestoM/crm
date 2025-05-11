import { supabaseClient } from '../../../services/supabase/client';
import {
  CreateNotificationInput,
  CreateTemplateInput,
  Notification,
  NotificationFilters,
  NotificationStatus,
  NotificationTemplate,
  TemplateFilters,
  UpdateNotificationInput,
  UpdateTemplateInput
} from '../domain/types';
import { DEFAULT_NOTIFICATION_PRIORITY, DEFAULT_NOTIFICATION_STATUS, MAX_NOTIFICATIONS_PER_BATCH } from '../domain/constants';

/**
 * Repository for notification data operations
 */
export const notificationRepository = {
  /**
   * Get all notifications with optional filtering and pagination
   */
  async getNotifications(
    filters?: NotificationFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ notifications: Notification[]; totalCount: number }> {
    try {
      // Initial query builder
      let query = supabaseClient
        .from('notifications')
        .select('*', { count: 'exact' });

      // Apply filters if provided
      if (filters) {
        if (filters.recipient_id) {
          query = query.eq('recipient_id', filters.recipient_id);
        }

        if (filters.type) {
          if (Array.isArray(filters.type)) {
            query = query.in('type', filters.type);
          } else {
            query = query.eq('type', filters.type);
          }
        }

        if (filters.channel) {
          if (Array.isArray(filters.channel)) {
            query = query.in('channel', filters.channel);
          } else {
            query = query.eq('channel', filters.channel);
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
          query = query.gte('created_at', filters.date_from.toISOString());
        }

        if (filters.date_to) {
          query = query.lte('created_at', filters.date_to.toISOString());
        }

        if (filters.search) {
          query = query.or(
            `subject.ilike.%${filters.search}%,content.ilike.%${filters.search}%`
          );
        }
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Order by creation date descending
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Process the returned data to format dates properly
      const notifications = (data || []).map(notification => ({
        ...notification,
        scheduled_for: notification.scheduled_for ? new Date(notification.scheduled_for) : undefined,
        sent_at: notification.sent_at ? new Date(notification.sent_at) : undefined,
        delivered_at: notification.delivered_at ? new Date(notification.delivered_at) : undefined,
        read_at: notification.read_at ? new Date(notification.read_at) : undefined,
        created_at: new Date(notification.created_at),
        updated_at: new Date(notification.updated_at)
      })) as Notification[];

      return {
        notifications,
        totalCount: count || 0
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Get a single notification by ID
   */
  async getNotificationById(id: string): Promise<Notification | null> {
    try {
      const { data, error } = await supabaseClient
        .from('notifications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Record not found
          return null;
        }
        throw error;
      }

      // Process the returned data to format dates properly
      return {
        ...data,
        scheduled_for: data.scheduled_for ? new Date(data.scheduled_for) : undefined,
        sent_at: data.sent_at ? new Date(data.sent_at) : undefined,
        delivered_at: data.delivered_at ? new Date(data.delivered_at) : undefined,
        read_at: data.read_at ? new Date(data.read_at) : undefined,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      } as Notification;
    } catch (error) {
      console.error(`Error fetching notification with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new notification
   */
  async createNotification(notificationData: CreateNotificationInput): Promise<Notification> {
    try {
      // Format dates for database
      const scheduledFor = notificationData.scheduled_for 
        ? (notificationData.scheduled_for instanceof Date 
            ? notificationData.scheduled_for.toISOString() 
            : new Date(notificationData.scheduled_for).toISOString()) 
        : null;
      
      // Create notification with defaults
      const notificationWithDefaults = {
        type: notificationData.type,
        channel: notificationData.channel,
        recipient_id: notificationData.recipient_id,
        recipient_email: notificationData.recipient_email,
        recipient_phone: notificationData.recipient_phone,
        recipient_device_token: notificationData.recipient_device_token,
        subject: notificationData.subject,
        content: notificationData.content,
        data: notificationData.data,
        status: DEFAULT_NOTIFICATION_STATUS,
        priority: notificationData.priority || DEFAULT_NOTIFICATION_PRIORITY,
        scheduled_for: scheduledFor,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient
        .from('notifications')
        .insert(notificationWithDefaults)
        .select()
        .single();

      if (error) throw error;

      // Return the notification with proper date handling
      return {
        ...data,
        scheduled_for: data.scheduled_for ? new Date(data.scheduled_for) : undefined,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      } as Notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  /**
   * Update an existing notification
   */
  async updateNotification(notificationData: UpdateNotificationInput): Promise<Notification> {
    try {
      const updates: any = { ...notificationData };
      
      // Remove id from updates
      delete updates.id;
      
      // Format dates for database
      if (updates.sent_at) {
        updates.sent_at = updates.sent_at instanceof Date
          ? updates.sent_at.toISOString()
          : new Date(updates.sent_at).toISOString();
      }
      
      if (updates.delivered_at) {
        updates.delivered_at = updates.delivered_at instanceof Date
          ? updates.delivered_at.toISOString()
          : new Date(updates.delivered_at).toISOString();
      }
      
      if (updates.read_at) {
        updates.read_at = updates.read_at instanceof Date
          ? updates.read_at.toISOString()
          : new Date(updates.read_at).toISOString();
      }
      
      // Add updated_at timestamp
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabaseClient
        .from('notifications')
        .update(updates)
        .eq('id', notificationData.id)
        .select()
        .single();

      if (error) throw error;

      // Return the notification with proper date handling
      return {
        ...data,
        scheduled_for: data.scheduled_for ? new Date(data.scheduled_for) : undefined,
        sent_at: data.sent_at ? new Date(data.sent_at) : undefined,
        delivered_at: data.delivered_at ? new Date(data.delivered_at) : undefined,
        read_at: data.read_at ? new Date(data.read_at) : undefined,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      } as Notification;
    } catch (error) {
      console.error(`Error updating notification with ID ${notificationData.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a notification by ID
   */
  async deleteNotification(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error(`Error deleting notification with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    try {
      const updates = {
        status: NotificationStatus.READ,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient
        .from('notifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Return the notification with proper date handling
      return {
        ...data,
        scheduled_for: data.scheduled_for ? new Date(data.scheduled_for) : undefined,
        sent_at: data.sent_at ? new Date(data.sent_at) : undefined,
        delivered_at: data.delivered_at ? new Date(data.delivered_at) : undefined,
        read_at: data.read_at ? new Date(data.read_at) : undefined,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      } as Notification;
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      throw error;
    }
  },

  /**
   * Get pending notifications that are due for processing
   */
  async getPendingNotifications(): Promise<Notification[]> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabaseClient
        .from('notifications')
        .select('*')
        .eq('status', NotificationStatus.PENDING)
        .or(`scheduled_for.is.null,scheduled_for.lte.${now}`)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(MAX_NOTIFICATIONS_PER_BATCH);
      
      if (error) throw error;
      
      // Process the returned data to format dates properly
      return (data || []).map(notification => ({
        ...notification,
        scheduled_for: notification.scheduled_for ? new Date(notification.scheduled_for) : undefined,
        created_at: new Date(notification.created_at),
        updated_at: new Date(notification.updated_at)
      })) as Notification[];
    } catch (error) {
      console.error('Error fetching pending notifications:', error);
      throw error;
    }
  },

  /**
   * Get all notification templates with optional filtering and pagination
   */
  async getTemplates(
    filters?: TemplateFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ templates: NotificationTemplate[]; totalCount: number }> {
    try {
      // Initial query builder
      let query = supabaseClient
        .from('notification_templates')
        .select('*', { count: 'exact' });

      // Apply filters if provided
      if (filters) {
        if (filters.type) {
          if (Array.isArray(filters.type)) {
            query = query.in('type', filters.type);
          } else {
            query = query.eq('type', filters.type);
          }
        }

        if (filters.channel) {
          if (Array.isArray(filters.channel)) {
            query = query.in('channel', filters.channel);
          } else {
            query = query.eq('channel', filters.channel);
          }
        }

        if (filters.active !== undefined) {
          query = query.eq('active', filters.active);
        }

        if (filters.search) {
          query = query.or(
            `name.ilike.%${filters.search}%,subject_template.ilike.%${filters.search}%,content_template.ilike.%${filters.search}%`
          );
        }
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Order by name
      query = query
        .order('name', { ascending: true })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Process the returned data to format dates properly
      const templates = (data || []).map(template => ({
        ...template,
        created_at: new Date(template.created_at),
        updated_at: new Date(template.updated_at)
      })) as NotificationTemplate[];

      return {
        templates,
        totalCount: count || 0
      };
    } catch (error) {
      console.error('Error fetching notification templates:', error);
      throw error;
    }
  },

  /**
   * Get a single template by ID
   */
  async getTemplateById(id: string): Promise<NotificationTemplate | null> {
    try {
      const { data, error } = await supabaseClient
        .from('notification_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Record not found
          return null;
        }
        throw error;
      }

      // Process the returned data to format dates properly
      return {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      } as NotificationTemplate;
    } catch (error) {
      console.error(`Error fetching template with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new notification template
   */
  async createTemplate(templateData: CreateTemplateInput): Promise<NotificationTemplate> {
    try {
      // Create template with defaults
      const templateWithDefaults = {
        name: templateData.name,
        type: templateData.type,
        channel: templateData.channel,
        subject_template: templateData.subject_template,
        content_template: templateData.content_template,
        active: templateData.active !== undefined ? templateData.active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient
        .from('notification_templates')
        .insert(templateWithDefaults)
        .select()
        .single();

      if (error) throw error;

      // Return the template with proper date handling
      return {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      } as NotificationTemplate;
    } catch (error) {
      console.error('Error creating notification template:', error);
      throw error;
    }
  },

  /**
   * Update an existing notification template
   */
  async updateTemplate(templateData: UpdateTemplateInput): Promise<NotificationTemplate> {
    try {
      const updates: any = { ...templateData };
      
      // Remove id from updates
      delete updates.id;
      
      // Add updated_at timestamp
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabaseClient
        .from('notification_templates')
        .update(updates)
        .eq('id', templateData.id)
        .select()
        .single();

      if (error) throw error;

      // Return the template with proper date handling
      return {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      } as NotificationTemplate;
    } catch (error) {
      console.error(`Error updating template with ID ${templateData.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a notification template by ID
   */
  async deleteTemplate(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('notification_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error(`Error deleting template with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get a template by type and channel
   */
  async getTemplateByTypeAndChannel(
    type: string,
    channel: string
  ): Promise<NotificationTemplate | null> {
    try {
      const { data, error } = await supabaseClient
        .from('notification_templates')
        .select('*')
        .eq('type', type)
        .eq('channel', channel)
        .eq('active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Record not found
          return null;
        }
        throw error;
      }

      // Process the returned data to format dates properly
      return {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      } as NotificationTemplate;
    } catch (error) {
      console.error(`Error fetching template for type ${type} and channel ${channel}:`, error);
      throw error;
    }
  }
}; 