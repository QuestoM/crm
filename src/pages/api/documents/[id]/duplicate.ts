import { NextApiRequest, NextApiResponse } from 'next';
import { duplicateDocumentHandler } from '../../../../modules/documents';
import { ApiResponse } from '../../../../lib/apiResponse';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> {
  switch (req.method) {
    case 'POST':
      return duplicateDocumentHandler(req, res);
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