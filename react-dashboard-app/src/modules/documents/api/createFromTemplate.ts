import { NextApiRequest, NextApiResponse } from 'next';
import { createDocumentFromTemplate } from '../service/documentService';
import { ApiResponse } from '../../../lib/apiResponse';
import { handleApiError } from '../../../lib/errorHandler';

export default async function createFromTemplateHandler(
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

    const { templateId } = req.query;

    if (!templateId || Array.isArray(templateId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETER',
          message: 'Template ID is required and must be a string'
        }
      });
    }

    // Custom data to apply to the new document
    const customData = req.body;

    const newDocument = await createDocumentFromTemplate(templateId, customData);

    return res.status(201).json({
      success: true,
      data: { document: newDocument }
    });
  } catch (error) {
    handleApiError(error, res);
  }
} 