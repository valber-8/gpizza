import { useQuery } from '@tanstack/react-query';
import { fetchOrder } from '../api/orders';

export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId!),
    enabled: !!orderId,
    refetchInterval: 30_000,
  });
}
