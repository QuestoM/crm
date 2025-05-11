import { NextApiRequest, NextApiResponse } from 'next';
import { getWarranties } from '../../service/warrantyService';
import { ApiResponse } from '../../../../lib/apiResponse';
import { handleApiError } from '../../../../lib/errorHandler';
import { WarrantyStatus } from '../../domain/types';

export default async function getWarrantiesHandler(
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
      customerId,
      productId,
      orderId,
      serialNumber,
      status,
      expiringBefore,
      expiringAfter,
      startedBefore,
      startedAfter,
      limit,
      offset,
      sortBy,
      sortOrder
    } = req.query;

    const filter: any = {};

    // Parse query parameters
    if (id) filter.id = String(id);
    if (customerId) filter.customerId = String(customerId);
    if (productId) filter.productId = String(productId);
    if (orderId) filter.orderId = String(orderId);
    if (serialNumber) filter.serialNumber = String(serialNumber);
    if (status) filter.status = String(status) as WarrantyStatus;
    if (expiringBefore) filter.expiringBefore = new Date(String(expiringBefore));
    if (expiringAfter) filter.expiringAfter = new Date(String(expiringAfter));
    if (startedBefore) filter.startedBefore = new Date(String(startedBefore));
    if (startedAfter) filter.startedAfter = new Date(String(startedAfter));
    if (limit) filter.limit = parseInt(String(limit), 10);
    if (offset) filter.offset = parseInt(String(offset), 10);
    if (sortBy) filter.sortBy = String(sortBy);
    if (sortOrder) filter.sortOrder = String(sortOrder) as 'asc' | 'desc';

    const { data, total } = await getWarranties(filter);

    return res.status(200).json({
      success: true,
      data: {
        warranties: data,
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