import { apiGet, apiPost } from './client';
import type { Order, PlaceOrderRequest, PlaceOrderResponse } from '../types';

export const placeOrder = (data: PlaceOrderRequest) =>
  apiPost<PlaceOrderResponse>({ ...data, action: 'order' });

export const fetchOrder = (id: string) =>
  apiGet<Order>('order', { id });
