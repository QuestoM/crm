import { NextApiRequest, NextApiResponse } from 'next';
import { getInventoryTransactions } from '../../service/inventoryService';
import { ApiResponse } from '../../../../lib/apiResponse';
import { handleApiError } from '../../../../lib/errorHandler';

export default async function getInventoryTransactionsHandler(
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

    const { inventoryItemId, limit, offset } = req.query;

    if (!inventoryItemId || Array.isArray(inventoryItemId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETER',
          message: 'Inventory item ID is required and must be a string'
        }
      });
    }

    const parsedLimit = limit ? parseInt(String(limit), 10) : undefined;
    const parsedOffset = offset ? parseInt(String(offset), 10) : undefined;

    const transactions = await getInventoryTransactions(
      inventoryItemId, 
      parsedLimit, 
      parsedOffset
    );

    return res.status(200).json({
      success: true,
      data: { 
        transactions,
        pagination: {
          limit: parsedLimit,
          offset: parsedOffset || 0
        }
      }
    });
  } catch (error) {
    handleApiError(error, res);
  }
} 