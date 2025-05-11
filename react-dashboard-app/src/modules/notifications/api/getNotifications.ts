import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Notification, NotificationChannel, NotificationFilters, NotificationPriority, NotificationStatus, NotificationType } from '../domain/types';
import { notificationService } from '../services/notificationService';

/**
 * API handler for getting notifications with filtering and pagination
 */
export default async function getNotificationsHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ notifications: Notification[], totalCount: number }>>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only GET requests are allowed',
      },
    });
  }
  
  try {
    // Extract query parameters
    const { 
      page, 
      pageSize, 
      recipient_id,
      type,
      channel,
      status,
      priority,
      date_from,
      date_to,
      search
    } = req.query;
    
    // Convert query params to proper types
    const filters: NotificationFilters = {};
    
    if (recipient_id) {
      filters.recipient_id = String(recipient_id);
    }
    
    if (type) {
      if (Array.isArray(type)) {
        filters.type = type.map(t => t as NotificationType);
      } else {
        filters.type = type as NotificationType;
      }
    }
    
    if (channel) {
      if (Array.isArray(channel)) {
        filters.channel = channel.map(c => c as NotificationChannel);
      } else {
        filters.channel = channel as NotificationChannel;
      }
    }
    
    if (status) {
      if (Array.isArray(status)) {
        filters.status = status.map(s => s as NotificationStatus);
      } else {
        filters.status = status as NotificationStatus;
      }
    }
    
    if (priority) {
      if (Array.isArray(priority)) {
        filters.priority = priority.map(p => p as NotificationPriority);
      } else {
        filters.priority = priority as NotificationPriority;
      }
    }
    
    if (date_from) {
      filters.date_from = new Date(String(date_from));
    }
    
    if (date_to) {
      filters.date_to = new Date(String(date_to));
    }
    
    if (search) {
      filters.search = String(search);
    }
    
    // Convert pagination params
    const pageNumber = page ? parseInt(String(page), 10) : 1;
    const itemsPerPage = pageSize ? parseInt(String(pageSize), 10) : 20;
    
    // Get notifications with filters and pagination
    const result = await notificationService.getNotifications(
      filters,
      pageNumber,
      itemsPerPage
    );
    
    // Return response
    return res.status(200).json({
      data: result,
      meta: {
        page: pageNumber,
        pageSize: itemsPerPage,
        totalCount: result.totalCount,
        totalPages: Math.ceil(result.totalCount / itemsPerPage)
      }
    });
  } catch (error) {
    console.error('Error in getNotifications API:', error);
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching notifications',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 