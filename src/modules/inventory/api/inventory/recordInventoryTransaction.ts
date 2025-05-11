import { NextApiRequest, NextApiResponse } from 'next';
import { recordInventoryTransaction } from '../../service/inventoryService';
import { ApiResponse } from '../../../../lib/apiResponse';
import { handleApiError } from '../../../../lib/errorHandler';

export default async function recordInventoryTransactionHandler(
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
    const transactionData = req.body;

    // Create the transaction
    const transaction = await recordInventoryTransaction(transactionData);

    return res.status(201).json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    handleApiError(error, res);
  }
} 