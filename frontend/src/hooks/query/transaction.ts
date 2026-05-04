import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { ENDPOINT } from '@/api/endpoint';
import type { 
  Transaction, 
  TransactionCreatePayload, 
  TransferCreatePayload, 
  TransactionUpdatePayload 
} from '@/type/transaction.type';
import type { PaginatedResponse } from '@/type/table.type';

export const useGetTransactions = (params: Record<string, any>) => {
  return useQuery({
    queryKey:['transactions', params],
    queryFn: () => api.get<PaginatedResponse<Transaction>>(ENDPOINT.TRANSACTION.LIST, params),
    staleTime: 1000 * 60 * 5, 
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransactionCreatePayload) => 
      api.post<Transaction>(ENDPOINT.TRANSACTION.EXPENSE, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
};

export const useCreateIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransactionCreatePayload) => 
      api.post<Transaction>(ENDPOINT.TRANSACTION.INCOME, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey:['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransferCreatePayload) => 
      api.post<Transaction>(ENDPOINT.TRANSACTION.TRANSFER, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: TransactionUpdatePayload }) => 
      api.put<Transaction>(ENDPOINT.TRANSACTION.UPDATE(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(ENDPOINT.TRANSACTION.DELETE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
};