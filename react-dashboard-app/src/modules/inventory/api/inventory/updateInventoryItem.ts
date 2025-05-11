import { NextApiRequest, NextApiResponse } from 'next';
import { modifyInventoryItem } from '../../service/inventoryService';
import { ApiResponse } from '../../../../lib/apiResponse';
import { handleApiError } from '../../../../lib/errorHandler';

export default async function updateInventoryItemHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> {
  try {
    if (req.method !== 'PUT' && req.method !== 'PATCH') {
      return res.status(405).json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only PUT and PATCH methods are allowed'
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

    // Extract data from request body
    const itemData = req.body;

    // Update the inventory item
    const updatedItem = await modifyInventoryItem(id, itemData);

    return res.status(200).json({
      success: true,
      data: { item: updatedItem }
    });
  } catch (error) {
    handleApiError(error, res);
  }
} 