import { NextApiRequest, NextApiResponse } from 'next';
import { getDocuments } from '../service/documentService';
import { ApiResponse } from '../../../lib/apiResponse';
import { handleApiError } from '../../../lib/errorHandler';

export default async function getDocumentsHandler(
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

    const {
      id,
      title,
      type,
      status,
      accessLevel,
      customerId,
      productId,
      orderId,
      invoiceId,
      leadId,
      appointmentId,
      tags,
      createdBy,
      createdAfter,
      createdBefore,
      isTemplate,
      searchQuery,
      limit,
      offset,
      sortBy,
      sortOrder
    } = req.query;

    const filter: any = {};

    // Parse query parameters
    if (id) filter.id = String(id);
    if (title) filter.title = String(title);
    if (type) filter.type = String(type);
    if (status) filter.status = String(status);
    if (accessLevel) filter.accessLevel = String(accessLevel);
    if (customerId) filter.customerId = String(customerId);
    if (productId) filter.productId = String(productId);
    if (orderId) filter.orderId = String(orderId);
    if (invoiceId) filter.invoiceId = String(invoiceId);
    if (leadId) filter.leadId = String(leadId);
    if (appointmentId) filter.appointmentId = String(appointmentId);
    if (tags) filter.tags = Array.isArray(tags) ? tags : [String(tags)];
    if (createdBy) filter.createdBy = String(createdBy);
    if (createdAfter) filter.createdAfter = new Date(String(createdAfter));
    if (createdBefore) filter.createdBefore = new Date(String(createdBefore));
    if (isTemplate !== undefined) filter.isTemplate = isTemplate === 'true';
    if (searchQuery) filter.searchQuery = String(searchQuery);
    if (limit) filter.limit = parseInt(String(limit), 10);
    if (offset) filter.offset = parseInt(String(offset), 10);
    if (sortBy) filter.sortBy = String(sortBy);
    if (sortOrder) filter.sortOrder = String(sortOrder) as 'asc' | 'desc';

    const { data, total } = await getDocuments(filter);

    return res.status(200).json({
      success: true,
      data: {
        documents: data,
        pagination: {
          total,
          limit: filter.limit,
          offset: filter.offset || 0
        }
      }
    });
  } catch (error) {
    handleApiError(error, res);
  }
} 