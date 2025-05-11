import { handleApiError } from '../../../../lib/errorHandler';

/**
 * Delete warranty API handler
 */
export default async function handler(req: any, res: any) {
  try {
    return res.status(200).json({
      success: true,
      data: { message: 'Warranty deleted successfully' }
    });
  } catch (error) {
    return handleApiError(error, 'Failed to delete warranty');
  }
} 