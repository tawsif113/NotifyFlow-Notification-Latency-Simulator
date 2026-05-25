export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

export type NotificationRequestStatus = 'NEW' | 'PROCESSING' | 'SENT' | 'DELIVERED' | 'FAILED' | string;

export interface NotificationRequestCreate {
  tenantId: string;
  idempotencyKey: string;
  eventType: string;
  templateKey?: string;
  variables: Record<string, unknown>;
  userIds: string[];
}

export interface NotificationRequestRecord {
  id: string;
  tenantId?: string;
  idempotencyKey?: string;
  eventType?: string;
  templateKey?: string | null;
  variables?: Record<string, unknown>;
  status: NotificationRequestStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface OutboxEventRecord {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: string;
  attempts: number;
  nextAttemptAt: string;
  createdAt: string;
  publishedAt?: string | null;
  lastError?: string | null;
}

export interface HealthResponse {
  status: string;
  [key: string]: unknown;
}

export interface DeliveryPayload {
  notificationRequestId?: string;
  userId?: string;
  tenantId?: string;
  deliveredAt?: string;
  createdAt?: string;
  latencyMs?: number;
  title?: string;
  message?: string;
  body?: string;
  status?: string;
  payload?: unknown;
  [key: string]: unknown;
}

export interface UserProfile {
  id: string;
  label: string;
  topic: string;
}

export interface DeliveryRecord {
  id: string;
  userId: string;
  notificationRequestId: string;
  latencyMs: number | null;
  receivedAt: string;
  summary: string;
  raw: DeliveryPayload;
}

export interface BroadcastFormState {
  title: string;
  body: string;
  tenantId: string;
  templateKey: string;
  eventType: string;
}

export interface DashboardStats {
  delivered: number;
  expected: number;
  fastestLatencyMs: number | null;
  slowestLatencyMs: number | null;
  averageLatencyMs: number | null;
}
