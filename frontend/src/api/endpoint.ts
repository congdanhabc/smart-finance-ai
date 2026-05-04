export const ENDPOINT = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    RESEND_OTP: '/auth/resend_otp',
    VERIFY_REGISTRATION: '/auth/verify_registration',
    FORGOT_PASSWORD: 'auth/forgot_password',
    RESET_PASSWORD: 'auth/reset_password',
    UPDATE_ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  WALLET: {
    LIST: '/wallet',
    CREATE: '/wallet',
    DEPOSIT: (id: string) => `/wallet/${id}/deposit`,
    DELETE_UPDATE: (id: string) => `/wallet/${id}`,
  },
  CATEGORY: {
    LIST: '/category',
    CREATE: '/category',
    UPDATE: (id: string) => `/category/${id}`,
    DELETE: (id: string) => `/category/${id}`,
  },
  TRANSACTION: {
    LIST: '/transaction/',
    EXPENSE: '/transaction/expense',
    INCOME: '/transaction/income',
    TRANSFER: '/transaction/transfer',
    UPDATE: (id: string) => `/transaction/${id}`,
    DELETE: (id: string) => `/transaction/${id}`,
  },
  STATISTIC: {
    DASHBOARD: '/statistic/dashboard',
  },
  AI: {
    SCAN_RECEIPT: '/ai/scan-receipt',
    CHAT: '/ai/chat',
  },
} as const;