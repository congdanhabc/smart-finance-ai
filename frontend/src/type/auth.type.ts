import type { UserProps } from "./user.type";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

export interface VerifyPayload {
  email: string;
  code: string
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProps;
}