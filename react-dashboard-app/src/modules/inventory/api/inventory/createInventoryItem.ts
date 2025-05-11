import { NextApiRequest, NextApiResponse } from 'next';
import { addInventoryItem } from '../../service/inventoryService';
import { ApiResponse } from '../../../../lib/apiResponse';
import { handleApiError } from '../../../../lib/errorHandler';

export default async function createInventoryItemHandler(
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

    // Extract data from request body
    const itemData = req.body;

    // Create the inventory item
    const item = await addInventoryItem(itemData);

    return res.status(201).json({
      success: true,
      data: { item }
    });
  } catch (error) {
    handleApiError(error, res);
  }
} 