import { handleApiError } from '../../../../lib/errorHandler';

/**
 * Create warranty claim API handler
 */
export default async function handler(req: any, res: any) {
  try {
    return res.status(201).json({
      success: true,
      data: {
        id: '1',
        warranty_id: '1',
        status: 'pending',
        description: 'Sample warranty claim',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    return handleApiError(error, 'Failed to create warranty claim');
  }
} 