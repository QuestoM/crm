import { NextApiRequest, NextApiResponse } from 'next';
import { getInventoryItems } from '../../service/inventoryService';
import { ApiResponse } from '../../../../lib/apiResponse';
import { handleApiError } from '../../../../lib/errorHandler';
import { InventoryItemStatus } from '../../domain/types';

export default async function getInventoryItemsHandler(
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
      productId,
      sku,
      name,
      status,
      tags,
      supplier,
      location,
      lowStock,
      searchQuery,
      limit,
      offset,
      sortBy,
      sortOrder
    } = req.query;

    const filter: any = {};

    // Parse query parameters
    if (id) filter.id = String(id);
    if (productId) filter.productId = String(productId);
    if (sku) filter.sku = String(sku);
    if (name) filter.name = String(name);
    if (status) filter.status = String(status) as InventoryItemStatus;
    if (tags) filter.tags = Array.isArray(tags) ? tags.map(String) : [String(tags)];
    if (supplier) filter.supplier = String(supplier);
    if (location) filter.location = String(location);
    if (lowStock) filter.lowStock = lowStock === 'true';
    if (searchQuery) filter.searchQuery = String(searchQuery);
    if (limit) filter.limit = parseInt(String(limit), 10);
    if (offset) filter.offset = parseInt(String(offset), 10);
    if (sortBy) filter.sortBy = String(sortBy);
    if (sortOrder) filter.sortOrder = String(sortOrder) as 'asc' | 'desc';

    const { data, total } = await getInventoryItems(filter);

    return res.status(200).json({
      success: true,
      data: {
        items: data,
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