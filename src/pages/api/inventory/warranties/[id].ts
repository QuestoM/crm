import { NextApiRequest, NextApiResponse } from 'next';
import { 
  getWarrantyByIdHandler, 
  updateWarrantyHandler,
  deleteWarrantyHandler
} from '../../../../modules/inventory';
import { ApiResponse } from '../../../../lib/apiResponse';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> {
  switch (req.method) {
    case 'GET':
      return getWarrantyByIdHandler(req, res);
    case 'PUT':
    case 'PATCH':
      return updateWarrantyHandler(req, res);
    case 'DELETE':
      return deleteWarrantyHandler(req, res);
    default:
      return res.status(405).json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${req.method} is not allowed`
        }
      });
  }
} 