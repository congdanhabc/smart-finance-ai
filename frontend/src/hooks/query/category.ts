import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { ENDPOINT } from '@/api/endpoint';
import type { Category, CategoryCreatePayload, CategoryUpdatePayload } from '@/type/category.type';
import type { PaginatedResponse } from '@/type/table.type';


export const useGetCategories = (params: any) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => api.get<PaginatedResponse<Category>>(ENDPOINT.CATEGORY.LIST, params),
    staleTime: 1000 * 60 * 10, 
  });
};


export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryCreatePayload) => 
      api.post<Category>(ENDPOINT.CATEGORY.CREATE, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: CategoryUpdatePayload }) => 
      api.put<Category>(ENDPOINT.CATEGORY.UPDATE(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(ENDPOINT.CATEGORY.DELETE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};