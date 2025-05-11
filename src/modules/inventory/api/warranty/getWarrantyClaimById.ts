import { handleApiError } from '../../../../lib/errorHandler';

/**
 * Get warranty claim by ID API handler
 */
export default async function handler(req: any, res: any) {
  try {
    return res.status(200).json({
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
    return handleApiError(error, 'Failed to get warranty claim');
  }
} 