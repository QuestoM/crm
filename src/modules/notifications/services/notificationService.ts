import { notificationRepository } from '../repositories/notificationRepository';
import {
  CreateNotificationInput,
  CreateTemplateInput,
  Notification,
  NotificationChannel,
  NotificationFilters,
  NotificationStatus,
  NotificationTemplate,
  NotificationType,
  TemplateFilters,
  UpdateNotificationInput,
  UpdateTemplateInput
} from '../domain/types';
import { validateCreateNotification, validateCreateTemplate, validateUpdateNotification, validateUpdateTemplate } from '../domain/validation';
import { DEFAULT_TEMPLATES, MAX_RETRY_ATTEMPTS } from '../domain/constants';

// Stub service implementations for notification delivery providers
// In a real implementation, these would be separate service modules
const emailService = {
  async sendEmail(recipient: string, subject: string, content: string): Promise<void> {
    console.log(`Sending email to ${recipient}: ${subject}`);
    // Actual implementation would connect to an email service provider
  }
};

const smsService = {
  async sendSMS(recipient: string, content: string): Promise<void> {
    console.log(`Sending SMS to ${recipient}: ${content.substring(0, 50)}...`);
    // Actual implementation would connect to an SMS service provider
  }
};

const pushService = {
  async sendPushNotification(deviceToken: string, title: string, body: string, data?: any): Promise<void> {
    console.log(`Sending push notification to device ${deviceToken}: ${title}`);
    // Actual implementation would connect to a push notification service
  }
};

const whatsappService = {
  async sendWhatsAppMessage(recipient: string, content: string, data?: any): Promise<void> {
    console.log(`Sending WhatsApp message to ${recipient}: ${content.substring(0, 50)}...`);
    // Actual implementation would connect to the WhatsApp Business API
  }
};

/**
 * Error class for notification validation errors
 */
export class NotificationValidationError extends Error {
  errors: Record<string, string>;
  
  constructor(message: string, errors: Record<string, string>) {
    super(message);
    this.name = 'NotificationValidationError';
    this.errors = errors;
  }
}

/**
 * Service for notification operations
 */
export const notificationService = {
  /**
   * Get notifications with optional filtering and pagination
   */
  async getNotifications(
    filters?: NotificationFilters,
    page?: number,
    pageSize?: number
  ): Promise<{ notifications: Notification[]; totalCount: number }> {
    return notificationRepository.getNotifications(filters, page, pageSize);
  },

  /**
   * Get a single notification by ID
   */
  async getNotificationById(id: string): Promise<Notification | null> {
    return notificationRepository.getNotificationById(id);
  },

  /**
   * Create a new notification with validation
   */
  async createNotification(notificationData: CreateNotificationInput): Promise<Notification> {
    // Validate the notification data
    const validation = validateCreateNotification(notificationData);
    
    if (!validation.isValid) {
      throw new NotificationValidationError('Notification validation failed', validation.errors);
    }
    
    // Create the notification
    return notificationRepository.createNotification(notificationData);
  },

  /**
   * Update a notification with validation
   */
  async updateNotification(notificationData: UpdateNotificationInput): Promise<Notification> {
    // Validate the notification data
    const validation = validateUpdateNotification(notificationData);
    
    if (!validation.isValid) {
      throw new NotificationValidationError('Notification validation failed', validation.errors);
    }
    
    // Check if the notification exists
    const existingNotification = await notificationRepository.getNotificationById(notificationData.id);
    
    if (!existingNotification) {
      throw new Error(`Notification with ID ${notificationData.id} not found`);
    }
    
    // Update the notification
    return notificationRepository.updateNotification(notificationData);
  },

  /**
   * Delete a notification by ID
   */
  async deleteNotification(id: string): Promise<boolean> {
    // Check if the notification exists
    const existingNotification = await notificationRepository.getNotificationById(id);
    
    if (!existingNotification) {
      throw new Error(`Notification with ID ${id} not found`);
    }
    
    // Delete the notification
    return notificationRepository.deleteNotification(id);
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    // Check if the notification exists
    const existingNotification = await notificationRepository.getNotificationById(id);
    
    if (!existingNotification) {
      throw new Error(`Notification with ID ${id} not found`);
    }
    
    // Mark the notification as read
    return notificationRepository.markAsRead(id);
  },

  /**
   * Create a notification from a template with data
   */
  async createFromTemplate(
    type: NotificationType,
    channel: NotificationChannel,
    data: Record<string, any>,
    recipientInfo: {
      recipient_id?: string;
      recipient_email?: string;
      recipient_phone?: string;
      recipient_device_token?: string;
    },
    scheduledFor?: Date
  ): Promise<Notification> {
    // Find a template or use a default one
    let template = await notificationRepository.getTemplateByTypeAndChannel(
      type,
      channel
    );
    
    // If no template found but default exists, use it
    if (!template && DEFAULT_TEMPLATES[type]?.[channel]) {
      const defaultTemplate = DEFAULT_TEMPLATES[type][channel];
      
      const templateInput: CreateTemplateInput = {
        name: `Default ${type} ${channel} template`,
        type,
        channel,
        subject_template: defaultTemplate.subject,
        content_template: defaultTemplate.content,
        active: true
      };
      
      template = await notificationRepository.createTemplate(templateInput);
    }
    
    if (!template) {
      throw new Error(`No template found for type ${type} and channel ${channel}`);
    }
    
    // Process the template with the data
    const subject = this.processTemplate(template.subject_template, data);
    const content = this.processTemplate(template.content_template, data);
    
    // Create the notification
    const notificationInput: CreateNotificationInput = {
      type,
      channel,
      ...recipientInfo,
      subject,
      content,
      data,
      scheduled_for: scheduledFor
    };
    
    return this.createNotification(notificationInput);
  },

  /**
   * Process a template string with data
   */
  processTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{([^}]+)\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  },

  /**
   * Process pending notifications
   */
  async processPendingNotifications(): Promise<number> {
    const pendingNotifications = await notificationRepository.getPendingNotifications();
    let processedCount = 0;
    
    for (const notification of pendingNotifications) {
      try {
        await this.sendNotification(notification);
        processedCount++;
      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error);
        
        // Update notification status based on retry count
        const currentRetryCount = notification.data?.retry_count || 0;
        
        if (currentRetryCount < MAX_RETRY_ATTEMPTS) {
          // Update for retry
          await notificationRepository.updateNotification({
            id: notification.id,
            status: NotificationStatus.PENDING,
            error_message: error instanceof Error ? error.message : String(error),
            data: {
              ...notification.data,
              retry_count: currentRetryCount + 1
            }
          });
        } else {
          // Mark as failed after max retries
          await notificationRepository.updateNotification({
            id: notification.id,
            status: NotificationStatus.FAILED,
            error_message: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }
    
    return processedCount;
  },

  /**
   * Send a notification based on its channel
   */
  async sendNotification(notification: Notification): Promise<void> {
    // Update notification status to indicate sending attempt
    await notificationRepository.updateNotification({
      id: notification.id,
      status: NotificationStatus.SENT,
      sent_at: new Date()
    });
    
    try {
      // Send notification based on channel
      switch (notification.channel) {
        case NotificationChannel.EMAIL:
          if (!notification.recipient_email) {
            throw new Error('Email recipient not specified');
          }
          
          await emailService.sendEmail(
            notification.recipient_email,
            notification.subject,
            notification.content
          );
          break;
          
        case NotificationChannel.SMS:
          if (!notification.recipient_phone) {
            throw new Error('SMS recipient not specified');
          }
          
          await smsService.sendSMS(
            notification.recipient_phone,
            notification.content
          );
          break;
          
        case NotificationChannel.PUSH:
          if (!notification.recipient_device_token) {
            throw new Error('Push notification recipient not specified');
          }
          
          await pushService.sendPushNotification(
            notification.recipient_device_token,
            notification.subject,
            notification.content,
            notification.data
          );
          break;
          
        case NotificationChannel.WHATSAPP:
          if (!notification.recipient_phone) {
            throw new Error('WhatsApp recipient not specified');
          }
          
          await whatsappService.sendWhatsAppMessage(
            notification.recipient_phone,
            notification.content,
            notification.data
          );
          break;
          
        case NotificationChannel.IN_APP:
          // In-app notifications are already stored in the database
          // They'll be fetched by the client later
          break;
          
        default:
          throw new Error(`Unsupported notification channel: ${notification.channel}`);
      }
      
      // Update notification status to delivered
      await notificationRepository.updateNotification({
        id: notification.id,
        status: NotificationStatus.DELIVERED,
        delivered_at: new Date()
      });
    } catch (error) {
      // Re-throw the error to be handled by the calling function
      throw error;
    }
  },

  /**
   * Get notification templates with optional filtering and pagination
   */
  async getTemplates(
    filters?: TemplateFilters,
    page?: number,
    pageSize?: number
  ): Promise<{ templates: NotificationTemplate[]; totalCount: number }> {
    return notificationRepository.getTemplates(filters, page, pageSize);
  },

  /**
   * Get a single template by ID
   */
  async getTemplateById(id: string): Promise<NotificationTemplate | null> {
    return notificationRepository.getTemplateById(id);
  },

  /**
   * Create a new template with validation
   */
  async createTemplate(templateData: CreateTemplateInput): Promise<NotificationTemplate> {
    // Validate the template data
    const validation = validateCreateTemplate(templateData);
    
    if (!validation.isValid) {
      throw new NotificationValidationError('Template validation failed', validation.errors);
    }
    
    // Create the template
    return notificationRepository.createTemplate(templateData);
  },

  /**
   * Update a template with validation
   */
  async updateTemplate(templateData: UpdateTemplateInput): Promise<NotificationTemplate> {
    // Validate the template data
    const validation = validateUpdateTemplate(templateData);
    
    if (!validation.isValid) {
      throw new NotificationValidationError('Template validation failed', validation.errors);
    }
    
    // Check if the template exists
    const existingTemplate = await notificationRepository.getTemplateById(templateData.id);
    
    if (!existingTemplate) {
      throw new Error(`Template with ID ${templateData.id} not found`);
    }
    
    // Update the template
    return notificationRepository.updateTemplate(templateData);
  },

  /**
   * Delete a template by ID
   */
  async deleteTemplate(id: string): Promise<boolean> {
    // Check if the template exists
    const existingTemplate = await notificationRepository.getTemplateById(id);
    
    if (!existingTemplate) {
      throw new Error(`Template with ID ${id} not found`);
    }
    
    // Delete the template
    return notificationRepository.deleteTemplate(id);
  },

  /**
   * Get notifications for a recipient
   */
  async getNotificationsForRecipient(
    recipientId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ notifications: Notification[]; totalCount: number }> {
    const filters: NotificationFilters = {
      recipient_id: recipientId
    };
    
    return notificationRepository.getNotifications(filters, page, pageSize);
  },

  /**
   * Get unread notifications for a recipient
   */
  async getUnreadNotificationsForRecipient(
    recipientId: string
  ): Promise<Notification[]> {
    const filters: NotificationFilters = {
      recipient_id: recipientId,
      status: NotificationStatus.DELIVERED
    };
    
    const { notifications } = await notificationRepository.getNotifications(filters, 1, 100);
    
    return notifications;
  },

  /**
   * Send a system notification to all administrators
   */
  async sendSystemNotification(
    subject: string,
    content: string,
    data?: Record<string, any>
  ): Promise<void> {
    // In a real implementation, we would fetch admin users from the database
    // For now, let's assume we have a configuration for admin email addresses
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    
    // Create notifications for each admin
    for (const email of adminEmails) {
      try {
        await this.createNotification({
          type: NotificationType.SYSTEM_ERROR,
          channel: NotificationChannel.EMAIL,
          recipient_email: email.trim(),
          subject,
          content,
          data
        });
      } catch (error) {
        console.error(`Failed to create system notification for admin ${email}:`, error);
      }
    }
  }
}; 