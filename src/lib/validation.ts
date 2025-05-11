import { z } from 'zod';
import { ValidationError } from './errors';

/**
 * Validate incoming data against a Zod schema
 */
export function validateBody<T extends z.ZodType>(data: unknown, schema: T): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.reduce((acc, curr) => {
        const path = curr.path.join('.');
        acc[path] = curr.message;
        return acc;
      }, {} as Record<string, string>);
      
      throw new ValidationError('Validation failed', formattedErrors);
    }
    throw error;
  }
}

/**
 * Validate a query parameter
 */
export function validateQuery<T extends z.ZodType>(
  value: unknown, 
  schema: T, 
  errorMessage = 'Invalid query parameter'
): z.infer<T> {
  try {
    return schema.parse(value);
  } catch (error) {
    throw new ValidationError(errorMessage);
  }
}

/**
 * Validate an ID parameter
 */
export function validateId(id: unknown): string {
  if (typeof id !== 'string' || !id) {
    throw new ValidationError('Invalid ID');
  }
  return id;
}

/**
 * Common schemas for reuse
 */
export const schemas = {
  id: z.string().uuid(),
  
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10)
  }),
  
  dateRange: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional()
  }),
  
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
}; 