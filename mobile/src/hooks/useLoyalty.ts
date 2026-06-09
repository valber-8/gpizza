import { useQuery } from '@tanstack/react-query';
import { fetchLoyalty } from '../api/loyalty';

export function useLoyalty(phone: string | null) {
  return useQuery({
    queryKey: ['loyalty', phone],
    queryFn: () => fetchLoyalty(phone!),
    enabled: !!phone,
    staleTime: 2 * 60 * 1000,
  });
}
