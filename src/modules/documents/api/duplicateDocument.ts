import { NextApiRequest, NextApiResponse } from 'next';
import { duplicateDocument } from '../service/documentService';
import { ApiResponse } from '../../../lib/apiResponse';
import { handleApiError } from '../../../lib/errorHandler';

export default async function duplicateDocumentHandler(
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
          message: 'Document ID is required and must be a string'
        }
      });
    }

    // Optional modifications to apply to the duplicated document
    const modifiedData = req.body;

    const duplicatedDocument = await duplicateDocument(id, modifiedData);

    return res.status(201).json({
      success: true,
      data: { document: duplicatedDocument }
    });
  } catch (error) {
    handleApiError(error, res);
  }
} 