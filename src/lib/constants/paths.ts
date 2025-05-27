export const Path = {
  ROOT: '/',
  LOGIN: '/login',
  ACCOUNT: '/account',
  API_KEYS: '/api-keys',
  USAGE: '/usage',
  RECHARGE: '/recharge',
  ACCESS: '/access',
  FAQ: '/faq',
  MODEL_LIST: '/model-list',
  WALLETS: '/wallets',
} as const; 

export const NO_SIDEBAR_PATHS: (typeof Path)[keyof typeof Path][] = [Path.LOGIN];