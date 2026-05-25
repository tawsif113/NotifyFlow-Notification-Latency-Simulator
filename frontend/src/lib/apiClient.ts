import { appConfig, buildApiUrl } from '@/config';
import type {
  HealthResponse,
  NotificationRequestCreate,
  NotificationRequestRecord,
  OutboxEventRecord
} from '@/types/backend';

class ApiError extends Error {
  readonly status?: number;
  readonly payload?: unknown;

  constructor(message: string, options?: { status?: number; payload?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status;
    this.payload = options?.payload;
  }
}

const parseResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'string' && payload.trim() ? payload : `Request failed with ${response.status}`;
    throw new ApiError(message, { status: response.status, payload });
  }

  return payload as T;
};

export const apiClient = {
  async health(signal?: AbortSignal) {
    const backendOrigin = new URL(appConfig.apiBaseUrl).origin;
    const response = await fetch(`${backendOrigin}${appConfig.healthPath}`, { signal });
    return parseResponse<HealthResponse>(response);
  },

  async createNotificationRequest(body: NotificationRequestCreate, signal?: AbortSignal) {
    const response = await fetch(buildApiUrl(appConfig.notificationRequestsPath), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal
    });

    return parseResponse<NotificationRequestRecord>(response);
  },

  async listNotificationRequests(signal?: AbortSignal) {
    const response = await fetch(buildApiUrl(appConfig.notificationRequestsPath), { signal });
    return parseResponse<NotificationRequestRecord[]>(response);
  },

  async listOutboxEvents(signal?: AbortSignal) {
    const response = await fetch(buildApiUrl('/outbox-events'), { signal });
    return parseResponse<OutboxEventRecord[]>(response);
  }
};

export { ApiError };
