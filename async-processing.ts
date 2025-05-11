// src/services/queue/queueService.ts
import { supabaseClient } from '../supabase/client';

// Define the task type interface
interface Task {
  id: string;
  type: string;
  payload: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  error?: string;
}

// Create a new task in the queue
export const createTask = async (
  type: string,
  payload: Record<string, any>,
  priority: number = 1,
  maxRetries: number = 3
): Promise<string> => {
  const { data, error } = await supabaseClient
    .from('tasks')
    .insert({
      type,
      payload,
      status: 'pending',
      priority,
      retry_count: 0,
      max_retries: maxRetries,
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create task: ${error.message}`);
  return data.id;
};

// Process tasks (to be called by serverless functions or cron jobs)
export const processTasks = async (
  taskType: string, 
  batchSize: number = 10,
  processorFn: (task: Task) => Promise<void>
): Promise<void> => {
  // Get pending tasks of the specified type, ordered by priority and creation time
  const { data: tasks, error } = await supabaseClient
    .from('tasks')
    .select('*')
    .eq('status', 'pending')
    .eq('type', taskType)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(batchSize);

  if (error) throw new Error(`Failed to fetch tasks: ${error.message}`);
  if (!tasks || tasks.length === 0) return;

  // Process each task
  for (const task of tasks) {
    // Update task status to processing
    await supabaseClient
      .from('tasks')
      .update({
        status: 'processing',
        processed_at: new Date().toISOString(),
      })
      .eq('id', task.id);

    try {
      // Process the task
      await processorFn(task as unknown as Task);

      // Update task status to completed
      await supabaseClient
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', task.id);
    } catch (error) {
      const err = error as Error;
      // Update retry count and status
      const retryCount = (task.retry_count || 0) + 1;
      const status = retryCount >= task.max_retries ? 'failed' : 'pending';

      await supabaseClient
        .from('tasks')
        .update({
          status,
          retry_count: retryCount,
          error: err.message,
        })
        .eq('id', task.id);
    }
  }
};

// Example task processor implementation for customer notifications
export const processNotificationTasks = async (): Promise<void> => {
  await processTasks('send_notification', 20, async (task) => {
    const { customerId, notificationType, content } = task.payload;
    
    // Fetch customer data
    const { data: customer } = await supabaseClient
      .from('customers')
      .select('email, phone_number, first_name, last_name')
      .eq('id', customerId)
      .single();
    
    if (!customer) throw new Error(`Customer not found: ${customerId}`);
    
    // Determine notification channel
    if (notificationType === 'email') {
      // Send email notification
      // Implementation depends on email service
    } else if (notificationType === 'sms') {
      // Send SMS notification
      // Implementation depends on SMS service
    }
    
    // Record notification as sent
    await supabaseClient
      .from('notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', task.payload.notificationId);
  });
};
