import { supabaseClient } from '../supabase/client';

// Define the task type interface
export interface Task {
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

/**
 * Create a new task in the queue
 * @param type Task type identifier
 * @param payload Task data
 * @param priority Priority (higher number = higher priority)
 * @param maxRetries Maximum retry attempts
 * @returns Task ID
 */
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

/**
 * Process tasks of a specific type
 * @param taskType Type of tasks to process
 * @param batchSize Maximum number of tasks to process
 * @param processorFn Function to process each task
 */
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

/**
 * Get a task by ID
 * @param taskId Task ID
 * @returns Task or null if not found
 */
export const getTaskById = async (taskId: string): Promise<Task | null> => {
  const { data, error } = await supabaseClient
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Record not found
    throw new Error(`Failed to get task: ${error.message}`);
  }
  
  return data as unknown as Task;
}; 