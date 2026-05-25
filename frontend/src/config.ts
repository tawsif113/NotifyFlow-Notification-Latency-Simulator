import { joinUrl, stripTrailingSlash } from '@/lib/url';

const env = import.meta.env;

const defaultApiBaseUrl = 'http://localhost:8080/api';
const defaultWsBaseUrl = 'ws://localhost:8080/ws';

export const appConfig = {
  apiBaseUrl: stripTrailingSlash(env.VITE_API_BASE_URL ?? defaultApiBaseUrl),
  wsBaseUrl: stripTrailingSlash(env.VITE_WS_BASE_URL ?? defaultWsBaseUrl),
  defaultTenantId: env.VITE_DEFAULT_TENANT_ID ?? 'demo-tenant',
  notificationRequestsPath: env.VITE_NOTIFICATION_REQUESTS_PATH ?? '/notification-requests',
  healthPath: env.VITE_HEALTH_PATH ?? '/actuator/health',
  userTopicTemplate: env.VITE_USER_TOPIC_TEMPLATE ?? '/topic/notifications/{tenantId}/{userId}',
  wsTransport: env.VITE_WS_TRANSPORT ?? 'websocket'
} as const;

export const buildApiUrl = (path: string) => joinUrl(appConfig.apiBaseUrl, path);
export const buildWsUrl = (path: string) => joinUrl(appConfig.wsBaseUrl, path);
