import { NextApiRequest, NextApiResponse } from 'next';
import { getWarrantyById, checkAndUpdateWarrantyStatus } from '../../service/warrantyService';
import { ApiResponse } from '../../../../lib/apiResponse';
import { handleApiError } from '../../../../lib/errorHandler';

export default async function getWarrantyByIdHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only GET method is allowed'
        }
      });
    }

    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETER',
          message: 'Warranty ID is required and must be a string'
        }
      });
    }

    // First check and update warranty status if needed
    const warranty = await checkAndUpdateWarrantyStatus(id);

    return res.status(200).json({
      success: true,
      data: { warranty }
    });
  } catch (error) {
    handleApiError(error, res);
  }
} 