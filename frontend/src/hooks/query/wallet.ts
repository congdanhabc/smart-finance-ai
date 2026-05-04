import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { ENDPOINT } from '@/api/endpoint';
import type { Wallet, WalletCreatePayload, WalletUpdatePayload } from '@/type/wallet.type';
import type { PaginatedResponse } from '@/type/table.type';


export const useGetWallets = (params: any) => {
  return useQuery({
    queryKey: ['wallets', params], 
    queryFn: () => api.get<PaginatedResponse<Wallet>>(ENDPOINT.WALLET.LIST, params),
  });
};

// 2. Hook Tạo ví mới
export const useCreateWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WalletCreatePayload) => 
      api.post<Wallet>(ENDPOINT.WALLET.CREATE, payload),
    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
};

export const useUpdateWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: WalletUpdatePayload }) => 
      api.put<Wallet>(ENDPOINT.WALLET.DELETE_UPDATE(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
};

export const useDeleteWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string ) => api.delete(ENDPOINT.WALLET.DELETE_UPDATE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
};