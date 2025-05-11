import { NextApiRequest, NextApiResponse } from 'next';
import { getDocumentsByEntity } from '../service/documentService';
import { ApiResponse } from '../../../lib/apiResponse';
import { handleApiError } from '../../../lib/errorHandler';

export default async function getDocumentsByEntityHandler(
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

    const { entityType, entityId, limit } = req.query;

    if (!entityType || Array.isArray(entityType) || !isValidEntityType(entityType)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETER',
          message: 'Valid entity type is required'
        }
      });
    }

    if (!entityId || Array.isArray(entityId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETER',
          message: 'Entity ID is required and must be a string'
        }
      });
    }

    const parsedLimit = limit ? parseInt(String(limit), 10) : undefined;

    const documents = await getDocumentsByEntity(
      mapEntityType(entityType),
      entityId,
      parsedLimit
    );

    return res.status(200).json({
      success: true,
      data: { documents }
    });
  } catch (error) {
    handleApiError(error, res);
  }
}

function isValidEntityType(entityType: string): boolean {
  return ['customer', 'product', 'order', 'invoice', 'lead', 'appointment'].includes(entityType);
}

function mapEntityType(entityType: string): 'customer' | 'product' | 'order' | 'invoice' | 'lead' | 'appointment' {
  const map: Record<string, 'customer' | 'product' | 'order' | 'invoice' | 'lead' | 'appointment'> = {
    'customer': 'customer',
    'product': 'product',
    'order': 'order',
    'invoice': 'invoice',
    'lead': 'lead',
    'appointment': 'appointment'
  };
  
  return map[entityType];
} 