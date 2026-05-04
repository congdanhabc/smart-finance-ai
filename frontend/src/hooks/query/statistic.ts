import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { ENDPOINT } from '@/api/endpoint';
import type { DashboardResponse, DashboardParams } from '@/type/statistic.type';

export const useGetDashboardStats = (params: DashboardParams) => {
  return useQuery({
    queryKey: ['statistics', params], 
    queryFn: () => api.get<DashboardResponse>(ENDPOINT.STATISTIC.DASHBOARD, params),
    staleTime: 1000 * 60 * 5, //5 phut
    
    placeholderData: (previousData) => previousData, 
  });
};