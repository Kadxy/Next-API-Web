/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
    readonly VITE_SERVER_BASE_URL_DEV: string;
    readonly VITE_SERVER_BASE_URL_PROD: string;
    readonly VITE_NODE_ENV: 'development' | 'production';
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}