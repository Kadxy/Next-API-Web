export const Path = {
  ROOT: '/',
  LOGIN: '/login',
  CALLBACK: '/callback',
  CALLBACK_DYNAMIC: '/callback/:platform/:action',
  ACCOUNT: '/account',
  API_KEYS: '/api-keys',
  USAGE: '/usage',
  RECHARGE: '/recharge',
  ACCESS: '/access',
  FAQ: '/faq',
  MODEL_LIST: '/model-list',
  WALLETS: '/wallets',
  WALLETS_DETAIL: '/wallets/:uid',
  TRANSACTIONS: '/transactions',
} as const;

export const NO_SIDEBAR_PATHS: (typeof Path)[keyof typeof Path][] = [Path.LOGIN, Path.CALLBACK];