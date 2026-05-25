import { createRandomKey, resolveTemplate } from '@/lib/url';
import type { BroadcastFormState, DashboardStats, DeliveryPayload, DeliveryRecord, UserProfile } from '@/types/backend';

export const createUsers = (count: number, tenantId: string): UserProfile[] =>
  Array.from({ length: count }, (_, index) => {
    const userId = `user-${index + 1}`;
    return {
      id: userId,
      label: `User ${index + 1}`,
      topic: resolveTemplate('/topic/notifications/{tenantId}/{userId}', {
        tenantId,
        userId
      })
    };
  });

export const createDefaultBroadcastForm = (tenantId: string): BroadcastFormState => ({
  tenantId,
  title: 'System update',
  body: 'This is a live notification broadcast to every simulated user.',
  templateKey: 'simulation.broadcast',
  eventType: 'NOTIFICATION_BROADCAST'
});

export const payloadToDeliveryRecord = (
  userId: string,
  payload: DeliveryPayload,
  fallbackRequestId: string
): DeliveryRecord => {
  const embeddedRequestId =
    typeof payload.payload === 'object' && payload.payload !== null && 'id' in payload.payload
      ? String((payload.payload as { id?: string }).id ?? fallbackRequestId)
      : fallbackRequestId;
  const requestId = String(payload.notificationRequestId ?? embeddedRequestId);
  const latency = typeof payload.latencyMs === 'number' && Number.isFinite(payload.latencyMs) ? payload.latencyMs : null;
  const summary = [payload.title, payload.message, payload.body].filter(Boolean).join(' • ') || 'Notification delivered';

  return {
    id: createRandomKey(),
    userId,
    notificationRequestId: requestId,
    latencyMs: latency,
    receivedAt: payload.deliveredAt ?? payload.createdAt ?? new Date().toISOString(),
    summary,
    raw: payload
  };
};

export const calculateDashboardStats = (
  expected: number,
  deliveries: DeliveryRecord[]
): DashboardStats => {
  const latencies = deliveries
    .map((delivery) => delivery.latencyMs)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

  const total = latencies.reduce((sum, value) => sum + value, 0);

  return {
    expected,
    delivered: deliveries.length,
    fastestLatencyMs: latencies.length ? Math.min(...latencies) : null,
    slowestLatencyMs: latencies.length ? Math.max(...latencies) : null,
    averageLatencyMs: latencies.length ? total / latencies.length : null
  };
};
