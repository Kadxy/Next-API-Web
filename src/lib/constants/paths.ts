export const Path = {
  ROOT: '/',
  LOGIN: '/login',
  ACCOUNT: '/account',
  API_KEYS: '/api-keys',
  USAGE: '/usage',
  RECHARGE: '/recharge',
  ACCESS: '/access',
} as const; 

export const NO_SIDEBAR_PATHS: (typeof Path)[keyof typeof Path][] = [Path.LOGIN];