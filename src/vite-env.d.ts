/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
    readonly VITE_SERVER_BASE_URL_DEV: string;
    readonly VITE_SERVER_BASE_URL_PROD: string;
    // 移除自定义的 VITE_NODE_ENV，使用 Vite 内置的 MODE
    // readonly VITE_NODE_ENV: 'development' | 'production';
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}