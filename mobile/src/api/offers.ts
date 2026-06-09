import { apiGet, apiPost } from './client';
import type { Offer } from '../types';

export const fetchOffers = () => apiGet<Offer[]>('offers');

export const validateOfferCode = (code: string, subtotal: number) =>
  apiPost<{ offer: Offer; discount: number; final_total: number }>({
    action: 'applyOffer',
    code,
    subtotal,
  });
