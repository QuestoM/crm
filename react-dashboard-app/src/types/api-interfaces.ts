// src/shared/api/types.ts
// API response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    totalCount?: number;
    totalPages?: number;
  };
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// Sorting parameters
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

// Filter parameters - generic for different entity types
export interface FilterParams {
  [key: string]: string | number | boolean | Array<string | number> | null;
}

// API query parameters
export interface QueryParams extends PaginationParams {
  sort?: SortParams;
  filter?: FilterParams;
  include?: string[];
}

// Generic API client interface
export interface ApiClient {
  get<T>(path: string, queryParams?: QueryParams): Promise<ApiResponse<T>>;
  post<T, U>(path: string, data: T): Promise<ApiResponse<U>>;
  put<T, U>(path: string, data: T): Promise<ApiResponse<U>>;
  patch<T, U>(path: string, data: Partial<T>): Promise<ApiResponse<U>>;
  delete<T>(path: string): Promise<ApiResponse<T>>;
}

// src/services/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import { ApiClient, ApiResponse, QueryParams } from '../../shared/api/types';

// Create Supabase client
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// API client implementation using Supabase
export class SupabaseApiClient implements ApiClient {
  async get<T>(path: string, queryParams?: QueryParams): Promise<ApiResponse<T>> {
    try {
      let query = supabaseClient.from(path).select('*');
      
      // Apply pagination
      if (queryParams?.page && queryParams?.pageSize) {
        const start = (queryParams.page - 1) * queryParams.pageSize;
        query = query.range(start, start + queryParams.pageSize - 1);
      }
      
      // Apply sorting
      if (queryParams?.sort) {
        query = query.order(queryParams.sort.field, { 
          ascending: queryParams.sort.direction === 'asc' 
        });
      }
      
      // Apply filters
      if (queryParams?.filter) {
        Object.entries(queryParams.filter).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }
      
      const { data, error, count } = await query.count('exact');
      
      if (error) throw error;
      
      return {
        data: data as T,
        meta: queryParams?.page && queryParams?.pageSize && count 
          ? {
              page: queryParams.page,
              pageSize: queryParams.pageSize,
              totalCount: count,
              totalPages: Math.ceil(count / queryParams.pageSize),
            }
          : undefined
      };
    } catch (error) {
      console.error('API get error:', error);
      return {
        error: {
          code: 'fetch_error',
          message: (error as Error).message,
        }
      };
    }
  }

  async post<T, U>(path: string, data: T): Promise<ApiResponse<U>> {
    try {
      const { data: result, error } = await supabaseClient
        .from(path)
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        data: result as U,
      };
    } catch (error) {
      console.error('API post error:', error);
      return {
        error: {
          code: 'create_error',
          message: (error as Error).message,
        }
      };
    }
  }

  async put<T, U>(path: string, data: T): Promise<ApiResponse<U>> {
    // Extract ID from data and use it to update the record
    const record = data as Record<string, any>;
    const id = record.id;
    
    if (!id) {
      return {
        error: {
          code: 'update_error',
          message: 'ID is required for update operations',
        }
      };
    }
    
    try {
      const { data: result, error } = await supabaseClient
        .from(path)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        data: result as U,
      };
    } catch (error) {
      console.error('API put error:', error);
      return {
        error: {
          code: 'update_error',
          message: (error as Error).message,
        }
      };
    }
  }

  async patch<T, U>(path: string, data: Partial<T>): Promise<ApiResponse<U>> {
    // Similar to put but for partial updates
    const record = data as Record<string, any>;
    const id = record.id;
    
    if (!id) {
      return {
        error: {
          code: 'update_error',
          message: 'ID is required for patch operations',
        }
      };
    }
    
    try {
      const { data: result, error } = await supabaseClient
        .from(path)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        data: result as U,
      };
    } catch (error) {
      console.error('API patch error:', error);
      return {
        error: {
          code: 'update_error',
          message: (error as Error).message,
        }
      };
    }
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    // Extract ID from path
    const segments = path.split('/');
    const id = segments[segments.length - 1];
    const resource = segments[segments.length - 2];
    
    try {
      const { data, error } = await supabaseClient
        .from(resource)
        .delete()
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        data: data as T,
      };
    } catch (error) {
      console.error('API delete error:', error);
      return {
        error: {
          code: 'delete_error',
          message: (error as Error).message,
        }
      };
    }
  }
}

// Create API client instance
export const apiClient = new SupabaseApiClient();

// External system integrations
// src/services/email/emailService.ts
export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    content: string; // Base64 encoded
    contentType: string;
  }>;
}

export interface EmailService {
  sendEmail(message: EmailMessage): Promise<boolean>;
  sendTemplatedEmail(
    to: string,
    templateId: string,
    variables: Record<string, string>
  ): Promise<boolean>;
}

export class SendGridEmailService implements EmailService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async sendEmail(message: EmailMessage): Promise<boolean> {
    try {
      // Implementation using SendGrid API
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: message.to }]
            }
          ],
          from: { email: process.env.EMAIL_FROM },
          subject: message.subject,
          content: [
            {
              type: 'text/html',
              value: message.body
            }
          ],
          attachments: message.attachments?.map(attachment => ({
            content: attachment.content,
            filename: attachment.filename,
            type: attachment.contentType,
            disposition: 'attachment'
          }))
        })
      });
      
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }
  
  async sendTemplatedEmail(
    to: string,
    templateId: string,
    variables: Record<string, string>
  ): Promise<boolean> {
    try {
      // Implementation using SendGrid API
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: to }],
              dynamic_template_data: variables
            }
          ],
          from: { email: process.env.EMAIL_FROM },
          template_id: templateId
        })
      });
      
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Failed to send templated email:', error);
      return false;
    }
  }
}

// SMS Service interface
// src/services/sms/smsService.ts
export interface SmsMessage {
  to: string;
  body: string;
}

export interface SmsService {
  sendSms(message: SmsMessage): Promise<boolean>;
}

export class TwilioSmsService implements SmsService {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;
  
  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
  }
  
  async sendSms(message: SmsMessage): Promise<boolean> {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: message.to,
          From: this.fromNumber,
          Body: message.body
        }).toString()
      });
      
      const result = await response.json();
      return result.status === 'queued' || result.status === 'sent';
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }
}
