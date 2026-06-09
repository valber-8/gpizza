import { useQuery } from '@tanstack/react-query';
import { fetchMenu } from '../api/menu';

export function useMenu() {
  return useQuery({
    queryKey: ['menu'],
    queryFn: fetchMenu,
    staleTime: 15 * 60 * 1000,
  });
}
