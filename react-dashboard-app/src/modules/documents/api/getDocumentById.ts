import { NextApiRequest, NextApiResponse } from 'next';
import { getDocumentById } from '../service/documentService';
import { ApiResponse } from '../../../lib/apiResponse';
import { handleApiError } from '../../../lib/errorHandler';

export default async function getDocumentByIdHandler(
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
          message: 'Document ID is required and must be a string'
        }
      });
    }

    const document = await getDocumentById(id);

    return res.status(200).json({
      success: true,
      data: { document }
    });
  } catch (error) {
    handleApiError(error, res);
  }
} 