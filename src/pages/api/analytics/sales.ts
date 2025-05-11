import { NextApiRequest, NextApiResponse } from 'next';
import { getSalesAnalyticsHandler } from '../../../modules/analytics';
import { ApiResponse } from '../../../lib/apiResponse';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> {
  return getSalesAnalyticsHandler(req, res);
} 