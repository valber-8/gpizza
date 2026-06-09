import { apiGet, apiPost } from './client';
import type { LoyaltyInfo, RedeemPointsResponse } from '../types';

export const fetchLoyalty = (phone: string) =>
  apiGet<LoyaltyInfo>('loyalty', { phone });

export const redeemPoints = (customer_id: string, points: number) =>
  apiPost<RedeemPointsResponse>({ action: 'redeemPoints', customer_id, points });
