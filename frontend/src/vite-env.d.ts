/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

declare interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_WS_BASE_URL?: string;
  readonly VITE_DEFAULT_TENANT_ID?: string;
  readonly VITE_NOTIFICATION_REQUESTS_PATH?: string;
  readonly VITE_HEALTH_PATH?: string;
  readonly VITE_USER_TOPIC_TEMPLATE?: string;
  readonly VITE_WS_TRANSPORT?: 'sockjs' | 'websocket' | string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
