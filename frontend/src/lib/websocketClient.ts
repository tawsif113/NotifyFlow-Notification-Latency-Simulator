import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import { appConfig } from '@/config';
import type { ConnectionStatus, DeliveryPayload } from '@/types/backend';

export interface NotificationSocketOptions {
  userId: string;
  topic: string;
  onMessage: (message: DeliveryPayload, raw: IMessage) => void;
  onStatusChange: (status: ConnectionStatus, detail?: string) => void;
  onError?: (error: unknown) => void;
}

export interface NotificationSocketHandle {
  connect: () => void;
  disconnect: () => Promise<void>;
  status: () => ConnectionStatus;
}

const resolveSocketUrl = () => appConfig.wsBaseUrl;

const buildClient = (options: NotificationSocketOptions): NotificationSocketHandle => {
  let status: ConnectionStatus = 'idle';
  let client: Client | undefined;
  let subscription: StompSubscription | undefined;

  const updateStatus = (nextStatus: ConnectionStatus, detail?: string) => {
    status = nextStatus;
    options.onStatusChange(nextStatus, detail);
  };

  const disconnect = async () => {
    subscription?.unsubscribe();
    subscription = undefined;
    if (client) {
      await client.deactivate();
      client = undefined;
    }
    updateStatus('disconnected');
  };

  let connectToken = 0;

  const connect = () => {
    if (client?.active) return;

    updateStatus(status === 'connected' ? 'connected' : 'connecting');

    const socketUrl = resolveSocketUrl();
    const useNativeWebSocket = /^wss?:\/\//i.test(appConfig.wsBaseUrl) || appConfig.wsTransport === 'websocket';
    const token = ++connectToken;

    void (async () => {
      if (!useNativeWebSocket) {
        (globalThis as { global?: typeof globalThis }).global ??= globalThis;
      }

      const sockjsModule = useNativeWebSocket ? null : (await import('sockjs-client') as unknown as { default: new (url: string) => WebSocket });
      if (token !== connectToken) return;
      const SockJS = sockjsModule?.default;

      client = new Client({
        reconnectDelay: 3000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: () => undefined,
        webSocketFactory: () => {
          if (useNativeWebSocket) {
            return new WebSocket(socketUrl);
          }
          if (!SockJS) {
            throw new Error('SockJS transport unavailable');
          }
          return new SockJS(socketUrl);
        },
        onConnect: () => {
          updateStatus('connected');
          subscription = client?.subscribe(options.topic, (frame) => {
            try {
              const parsed = JSON.parse(frame.body) as DeliveryPayload;
              options.onMessage(parsed, frame);
            } catch (error) {
              options.onError?.(error);
            }
          });
        },
        onWebSocketClose: () => {
          updateStatus('disconnected', 'Socket closed');
        },
        onDisconnect: () => {
          updateStatus('disconnected', 'Disconnected');
        },
        onStompError: (frame) => {
          const message = frame.headers['message'] ?? 'STOMP error';
          updateStatus('error', message);
          options.onError?.(new Error(message));
        },
        onWebSocketError: (event) => {
          const message = 'Unable to connect to websocket backend';
          updateStatus('error', message);
          options.onError?.(event);
        }
      });

      client.activate();
    })();
  };

  return {
    connect,
    disconnect,
    status: () => status
  };
};

export const notificationSocketFactory = {
  create(options: NotificationSocketOptions) {
    return buildClient(options);
  }
};
