import { useEffect, useMemo, useRef, useState } from 'react';
import { appConfig } from '@/config';
import { apiClient, ApiError } from '@/lib/apiClient';
import { calculateDashboardStats, createDefaultBroadcastForm, createUsers, payloadToDeliveryRecord } from '@/lib/dashboard';
import { createRandomKey, resolveTemplate } from '@/lib/url';
import { notificationSocketFactory } from '@/lib/websocketClient';
import type {
  BroadcastFormState,
  ConnectionStatus,
  DeliveryRecord,
  HealthResponse,
  NotificationRequestRecord,
  UserProfile
} from '@/types/backend';

interface UserState extends UserProfile {
  status: ConnectionStatus;
  statusDetail?: string;
  deliveries: DeliveryRecord[];
}

interface BroadcastBurst {
  requestId: string;
  userCount: number;
  startedAt: number;
}

interface DashboardState {
  backendStatus: 'checking' | 'healthy' | 'unhealthy';
  backendMessage: string;
  users: UserState[];
  count: number;
  form: BroadcastFormState;
  isSending: boolean;
  lastRequest?: NotificationRequestRecord;
  broadcastBurst?: BroadcastBurst;
  requestError?: string;
}

const makeUsers = (count: number, tenantId: string, existing: UserState[] = []) => {
  const preserved = new Map(existing.map((user) => [user.id, user] as const));
  return createUsers(count, tenantId).map((user) => {
    const current = preserved.get(user.id);
    return {
      ...user,
      status: current?.status ?? 'idle',
      statusDetail: current?.statusDetail,
      deliveries: current?.deliveries ?? []
    };
  });
};

const initialState = (count: number, tenantId: string): DashboardState => ({
  backendStatus: 'checking',
  backendMessage: 'Checking backend connectivity…',
  users: makeUsers(count, tenantId),
  count,
  form: createDefaultBroadcastForm(tenantId),
  isSending: false
});

type Action =
  | { type: 'set-connection'; userId: string; status: ConnectionStatus; statusDetail?: string }
  | { type: 'set-backend'; status: DashboardState['backendStatus']; message: string }
  | { type: 'set-count'; count: number }
  | { type: 'set-form'; form: Partial<BroadcastFormState> }
  | { type: 'sending'; value: boolean }
  | { type: 'request-error'; message?: string }
  | { type: 'request-success'; request: NotificationRequestRecord }
  | { type: 'burst-start'; requestId: string; userCount: number }
  | { type: 'burst-clear' }
  | { type: 'append-delivery'; userId: string; delivery: DeliveryRecord }
  | { type: 'reset-deliveries'; userId?: string };

const reducer = (state: DashboardState, action: Action): DashboardState => {
  switch (action.type) {
    case 'set-connection':
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.userId ? { ...user, status: action.status, statusDetail: action.statusDetail } : user
        )
      };
    case 'set-backend':
      return { ...state, backendStatus: action.status, backendMessage: action.message };
    case 'set-count':
      return {
        ...state,
        count: action.count,
        users: makeUsers(action.count, state.form.tenantId, state.users)
      };
    case 'set-form': {
      const nextForm = { ...state.form, ...action.form };
      const nextUsers =
        action.form.tenantId && action.form.tenantId !== state.form.tenantId
          ? makeUsers(state.count, action.form.tenantId, state.users)
          : state.users;
      return { ...state, form: nextForm, users: nextUsers, requestError: undefined };
    }
    case 'sending':
      return { ...state, isSending: action.value };
    case 'request-error':
      return { ...state, requestError: action.message, isSending: false };
    case 'request-success':
      return { ...state, lastRequest: action.request, requestError: undefined, isSending: false };
    case 'burst-start':
      return {
        ...state,
        broadcastBurst: { requestId: action.requestId, userCount: action.userCount, startedAt: Date.now() }
      };
    case 'burst-clear':
      return { ...state, broadcastBurst: undefined };
    case 'append-delivery':
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.userId ? { ...user, deliveries: [action.delivery, ...user.deliveries].slice(0, 5) } : user
        )
      };
    case 'reset-deliveries':
      return {
        ...state,
        users: state.users.map((user) =>
          !action.userId || user.id === action.userId ? { ...user, deliveries: [] } : user
        )
      };
    default:
      return state;
  }
};

export const useDashboardController = () => {
  const [state, dispatch] = useStateReducer(initialState(5, appConfig.defaultTenantId));
  const clientsRef = useRef(new Map<string, ReturnType<typeof notificationSocketFactory.create>>());
  const [health, setHealth] = useState<HealthResponse | undefined>();

  const expectedDeliveries = state.users.length;
  const allDeliveries = useMemo(() => state.users.flatMap((user) => user.deliveries), [state.users]);
  const stats = useMemo(() => calculateDashboardStats(expectedDeliveries, allDeliveries), [expectedDeliveries, allDeliveries]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const checkHealth = async () => {
      try {
        const result = await apiClient.health(controller.signal);
        if (!active) return;
        setHealth(result);
        dispatch({ type: 'set-backend', status: 'healthy', message: `Backend online (${String(result.status ?? 'ok')})` });
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : 'Backend unavailable';
        setHealth(undefined);
        dispatch({ type: 'set-backend', status: 'unhealthy', message });
      }
    };

    checkHealth();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    for (const client of clientsRef.current.values()) {
      void client.disconnect();
    }
    clientsRef.current.clear();

    for (const user of state.users) {
      const client = notificationSocketFactory.create({
        userId: user.id,
        topic: resolveTemplate(appConfig.userTopicTemplate, {
          tenantId: state.form.tenantId,
          userId: user.id
        }),
        onStatusChange: (status, detail) => {
          dispatch({ type: 'set-connection', userId: user.id, status, statusDetail: detail });
        },
        onMessage: (message) => {
          const requestId = String(
            message.notificationRequestId ??
              (typeof message.payload === 'object' && message.payload !== null && 'id' in message.payload
                ? String((message.payload as { id?: string }).id ?? createRandomKey())
                : createRandomKey())
          );
          const delivery = payloadToDeliveryRecord(user.id, { ...message, notificationRequestId: requestId }, requestId);
          dispatch({ type: 'append-delivery', userId: user.id, delivery });
        },
        onError: () => {
          dispatch({ type: 'set-connection', userId: user.id, status: 'error', statusDetail: 'Subscription failed' });
        }
      });
      clientsRef.current.set(user.id, client);
      client.connect();
    }

    return () => {
      for (const client of clientsRef.current.values()) {
        void client.disconnect();
      }
    };
  }, [state.count, state.form.tenantId]);

  useEffect(() => {
    return () => {
      for (const client of clientsRef.current.values()) {
        void client.disconnect();
      }
      clientsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!state.broadcastBurst) return;

    const timer = setTimeout(() => {
      dispatch({ type: 'burst-clear' });
    }, 1700);

    return () => clearTimeout(timer);
  }, [state.broadcastBurst?.requestId]);

  const setCount = (count: number) => {
    dispatch({ type: 'set-count', count });
  };

  const setForm = (form: Partial<BroadcastFormState>) => dispatch({ type: 'set-form', form });

  const refreshHealth = async () => {
    try {
      const result = await apiClient.health();
      setHealth(result);
      dispatch({ type: 'set-backend', status: 'healthy', message: `Backend online (${String(result.status ?? 'ok')})` });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Backend unavailable';
      setHealth(undefined);
      dispatch({ type: 'set-backend', status: 'unhealthy', message });
    }
  };

  const reconnectAll = async () => {
    for (const client of clientsRef.current.values()) {
      void client.disconnect();
      client.connect();
    }
    await refreshHealth();
  };

  const sendBroadcast = async () => {
    dispatch({ type: 'sending', value: true });
    dispatch({ type: 'request-error', message: undefined });

    const userIds = state.users.map((user) => user.id);
    const requestBody = {
      tenantId: state.form.tenantId,
      idempotencyKey: createRandomKey(),
      eventType: state.form.eventType,
      templateKey: state.form.templateKey,
      variables: {
        title: state.form.title,
        body: state.form.body,
        targetUsers: userIds.length
      },
      userIds
    };

    try {
      const request = await apiClient.createNotificationRequest(requestBody);
      dispatch({ type: 'request-success', request });
      dispatch({ type: 'burst-start', requestId: request.id, userCount: userIds.length });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Failed to create notification request';
      dispatch({ type: 'request-error', message });
    }
  };

  const updateTenant = (tenantId: string) => {
    dispatch({ type: 'set-form', form: { tenantId } });
  };

  return {
    state,
    health,
    stats,
    setCount,
    setForm,
    refreshHealth,
    reconnectAll,
    sendBroadcast,
    updateTenant,
    backendMessage: state.backendMessage
  };
};

function useStateReducer(initial: DashboardState) {
  const [state, setState] = useState(initial);
  const dispatch = (action: Action) => setState((current) => reducer(current, action));
  return [state, dispatch] as const;
}
