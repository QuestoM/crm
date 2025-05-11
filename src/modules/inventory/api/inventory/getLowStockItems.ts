import { NextApiRequest, NextApiResponse } from 'next';
import { getLowStockItems } from '../../service/inventoryService';
import { ApiResponse } from '../../../../lib/apiResponse';
import { handleApiError } from '../../../../lib/errorHandler';

export default async function getLowStockItemsHandler(
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

    const items = await getLowStockItems();

    return res.status(200).json({
      success: true,
      data: { items }
    });
  } catch (error) {
    handleApiError(error, res);
  }
} 