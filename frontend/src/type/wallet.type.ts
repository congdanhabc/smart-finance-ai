export type WalletType = "CASH" | "BANK" | "E_WALLET" | "CREDIT_CARD" | "LOAN";

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  created_at: string;
  is_active: boolean;
}

export interface WalletCreatePayload {
  name: string;
  type: WalletType;
  initial_balance: number;
}

export interface WalletUpdatePayload {
  name: string;
  is_active: boolean;
}

export interface WalletDepositPayload {
  amount: number;
  description?: string;
  transaction_date: string;
}