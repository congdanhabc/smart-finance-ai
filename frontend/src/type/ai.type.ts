import type { TransactionType } from "./transaction.type";

export interface TransactionDraft {
  amount: number;
  type: TransactionType;
  wallet_id: string | null;
  from_wallet_id?: string | null;
  to_wallet_id?: string | null;
  category_id: string | null;
  description: string;
  transaction_date: string;
}

export interface ChatPayload {
  message: string;
  history: {
    role: string;
    text: string;
  }[];
}

export interface ChatResponse {
  intent: "ENTRY" | "QUERY" | "ADVICE" | "ANOMALY";
  message: string;
  transaction_draft: any | null;
}

export interface ReceiptScanResponse {
  detail: string;
  transaction_draft: TransactionDraft;
}