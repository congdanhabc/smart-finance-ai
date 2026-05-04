import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';
import { ENDPOINT } from '@/api/endpoint';
import type { ChatPayload, ChatResponse, ReceiptScanResponse } from '@/type/ai.type';

export const useChatBot = () => {
  return useMutation({
    mutationFn: (payload: ChatPayload) => api.post<ChatResponse>(ENDPOINT.AI.CHAT, payload),
  });
};

export const useScanReceipt = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      return api.post<ReceiptScanResponse>(ENDPOINT.AI.SCAN_RECEIPT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  });
};