// src/api/endpoint.ts

export const ENDPOINT = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    RESEND_OTP: '/auth/resend_otp',
    VERIFY_REGISTRATION: '/auth/verify_registration',
    FORGOT_PASSWORD: 'auth/forgot_password',
    RESET_PASSWORD: 'auth/reset_password',
  },

  TRANSACTION: {
    BASE: '/transaction',
  }
} as const;