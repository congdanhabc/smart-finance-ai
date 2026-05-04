export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

//Cấu trúc dữ liệu trả về từ API
export interface Transaction {
  id: string;
  wallet_id: string;
  to_wallet_id?: string | null;
  category_id?: string | null;
  amount: number;
  type: TransactionType;
  description?: string | null;
  transaction_date: string;
  created_at: string;
  
  category?: { 
    id: string; 
    name: string; 
    icon?: string; 
    color?: string 
  } | null;
  wallet?: { 
    id: string; 
    name: string; 
    type: string 
  } | null;
  wallet_to?: { 
    id: string; 
    name: string; 
    type: string 
  } | null;
}

interface TransactionBasePayload {
  amount: number;
  description?: string;
  transaction_date?: string; 
}

// Payload Tạo Thu/Chi
export interface TransactionCreatePayload extends TransactionBasePayload {
  wallet_id: string;
  category_id: string;
}

// Payload Tạo Chuyển khoản (Không có category)
export interface TransferCreatePayload extends TransactionBasePayload {
  from_wallet_id: string;
  to_wallet_id: string;
}

// Payload Cập nhật
export interface TransactionUpdatePayload {
  amount?: number;
  category_id?: string;
  description?: string;
  transaction_date?: string;
}