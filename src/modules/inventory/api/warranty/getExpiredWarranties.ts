import { handleApiError } from '../../../../lib/errorHandler';

/**
 * Get expired warranties API handler
 */
export default async function handler(req: any, res: any) {
  try {
    return res.status(200).json({
      success: true,
      data: {
        warranties: [],
        total: 0
      }
    });
  } catch (error) {
    return handleApiError(error, 'Failed to get expired warranties');
  }
} 