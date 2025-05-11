import { NextApiRequest, NextApiResponse } from 'next';
import { getDashboardHandler } from '../../../modules/analytics';
import { ApiResponse } from '../../../lib/apiResponse';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> {
  return getDashboardHandler(req, res);
} 