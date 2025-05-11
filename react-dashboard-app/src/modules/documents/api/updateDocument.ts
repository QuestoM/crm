import { NextApiRequest, NextApiResponse } from 'next';
import { modifyDocument } from '../service/documentService';
import { ApiResponse } from '../../../lib/apiResponse';
import { handleApiError } from '../../../lib/errorHandler';

export default async function updateDocumentHandler(
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
          message: 'Document ID is required and must be a string'
        }
      });
    }

    const documentData = req.body;
    
    const updatedDocument = await modifyDocument(id, documentData);

    return res.status(200).json({
      success: true,
      data: { document: updatedDocument }
    });
  } catch (error) {
    handleApiError(error, res);
  }
} 