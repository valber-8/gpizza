import { useQuery } from '@tanstack/react-query';
import { fetchOffers } from '../api/offers';

export function useOffers() {
  return useQuery({
    queryKey: ['offers'],
    queryFn: fetchOffers,
    staleTime: 10 * 60 * 1000,
  });
}
