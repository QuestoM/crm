import { NextApiRequest, NextApiResponse } from 'next';
import { adjustInventoryQuantity } from '../../service/inventoryService';
import { ApiResponse } from '../../../../lib/apiResponse';
import { handleApiError } from '../../../../lib/errorHandler';

export default async function adjustInventoryQuantityHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only POST method is allowed'
        }
      });
    }

    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETER',
          message: 'Inventory item ID is required and must be a string'
        }
      });
    }

    const { quantity, reason, userId } = req.body;

    if (quantity === undefined || reason === undefined || !userId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Quantity, reason, and userId are required'
        }
      });
    }

    const updatedItem = await adjustInventoryQuantity(
      id,
      Number(quantity),
      String(reason),
      String(userId)
    );

    return res.status(200).json({
      success: true,
      data: { item: updatedItem }
    });
  } catch (error) {
    handleApiError(error, res);
  }
} 