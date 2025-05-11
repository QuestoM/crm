import { NextApiRequest, NextApiResponse } from 'next';
import { getDocumentTemplates } from '../service/documentService';
import { ApiResponse } from '../../../lib/apiResponse';
import { handleApiError } from '../../../lib/errorHandler';

export default async function getDocumentTemplatesHandler(
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

    const { type, limit } = req.query;

    const documentType = type && !Array.isArray(type) ? String(type) : undefined;
    const parsedLimit = limit ? parseInt(String(limit), 10) : undefined;

    const templates = await getDocumentTemplates(documentType, parsedLimit);

    return res.status(200).json({
      success: true,
      data: { templates }
    });
  } catch (error) {
    handleApiError(error, res);
  }
} 