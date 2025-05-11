import { NextApiRequest, NextApiResponse } from 'next';
import { addDocument } from '../service/documentService';
import { ApiResponse } from '../../../lib/apiResponse';
import { handleApiError } from '../../../lib/errorHandler';

export default async function createDocumentHandler(
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

    // Extracting the document data from the request body
    const documentData = req.body;

    // Creating the document
    const document = await addDocument(documentData);

    return res.status(201).json({
      success: true,
      data: { document }
    });
  } catch (error) {
    handleApiError(error, res);
  }
} 