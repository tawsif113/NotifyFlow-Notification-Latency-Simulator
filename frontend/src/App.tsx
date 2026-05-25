import { useId, useMemo, type CSSProperties } from 'react';
import { appConfig } from '@/config';
import { useDashboardController } from '@/hooks/useDashboardController';
import { formatIso, formatLatency } from '@/lib/url';
import './styles.css';

function App() {
  const dashboard = useDashboardController();

  const summaryLabel = useMemo(() => {
    if (dashboard.state.backendStatus === 'healthy') return 'Backend connected';
    if (dashboard.state.backendStatus === 'checking') return 'Checking backend';
    return 'Backend offline';
  }, [dashboard.state.backendStatus]);

  const connectedUsers = dashboard.state.users.filter((user) => user.status === 'connected').length;
  const warningUsers = dashboard.state.users.filter((user) => user.status === 'connecting' || user.status === 'reconnecting').length;
  const errorUsers = dashboard.state.users.filter((user) => user.status === 'error').length;
  const deliveryCoverage = dashboard.state.count > 0 ? Math.round((dashboard.stats.delivered / dashboard.state.count) * 100) : 0;

  const lastRequest = dashboard.state.lastRequest;
  const lastRequestTemplate = lastRequest?.templateKey ?? dashboard.state.form.templateKey;
  const latestLatency = formatLatency(dashboard.stats.averageLatencyMs);

  return (
    <div className="dashboard-shell">
      <header className="hero-panel panel">
        <div className="hero-copy">
          <p className="eyebrow">NotifyFlow · live relay desk</p>
          <h1>Broadcasts that read like an operations brief.</h1>
          <p className="subtitle">
            Shape a payload, send it through the room, and watch each lane light up in real time.
          </p>

          <div className="badge-row" aria-label="current dashboard signals">
            <span className="badge">Tenant {dashboard.state.form.tenantId}</span>
            <span className="badge">Users {dashboard.state.count}</span>
            <span className="badge">Coverage {deliveryCoverage}%</span>
            <span className="badge">Avg {latestLatency}</span>
          </div>

          <div className="action-row hero-actions">
            <button className="ghost-button" onClick={dashboard.refreshHealth} type="button">
              Refresh health
            </button>
            <button className="ghost-button" onClick={dashboard.reconnectAll} type="button">
              Reconnect sockets
            </button>
          </div>
        </div>

        <aside className="hero-rail">
          <article className="status-docket">
            <p className="panel-kicker">Current posture</p>
            <strong className="telemetry-title">{summaryLabel}</strong>
            <p className="telemetry-subtitle">{dashboard.state.backendMessage}</p>

            <div className="signal-grid">
              <MetricCard label="Connected" value={connectedUsers} tone="green" />
              <MetricCard label="Warming up" value={warningUsers} tone="orange" />
              <MetricCard label="Errors" value={errorUsers} tone="pink" />
              <MetricCard label="Coverage" value={`${deliveryCoverage}%`} tone="blue" />
            </div>
          </article>

          <article className="status-docket status-docket--compact">
            <div className="delivery-brief">
              <span>Delivery ledger</span>
              <strong>{latestLatency}</strong>
              <p>
                Fastest {formatLatency(dashboard.stats.fastestLatencyMs)} · Slowest {formatLatency(dashboard.stats.slowestLatencyMs)} · Coverage {deliveryCoverage}%
              </p>
            </div>
          </article>
        </aside>
      </header>

      <main className="command-grid">
        <section className="panel launch-panel">
          <div className="panel-header">
            <div>
              <h2>Broadcast composer</h2>
              <p>Set the payload once and let the room light up.</p>
            </div>
            <span className="panel-chip">{dashboard.state.form.eventType}</span>
          </div>

          <div className="launch-form">
            <div className="field-grid">
              <label>
                <span>Users</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={dashboard.state.count}
                  onChange={(event) => dashboard.setCount(Math.max(1, Math.min(50, Number(event.target.value) || 1)))}
                />
              </label>

              <label>
                <span>Tenant</span>
                <input
                  type="text"
                  value={dashboard.state.form.tenantId}
                  onChange={(event) => dashboard.updateTenant(event.target.value || appConfig.defaultTenantId)}
                />
              </label>

              <label>
                <span>Event type</span>
                <input
                  type="text"
                  value={dashboard.state.form.eventType}
                  onChange={(event) => dashboard.setForm({ eventType: event.target.value })}
                />
              </label>

              <label>
                <span>Template key</span>
                <input
                  type="text"
                  value={dashboard.state.form.templateKey}
                  onChange={(event) => dashboard.setForm({ templateKey: event.target.value })}
                />
              </label>
            </div>

            <label className="stacked-field">
              <span>Title</span>
              <input
                type="text"
                value={dashboard.state.form.title}
                onChange={(event) => dashboard.setForm({ title: event.target.value })}
              />
            </label>

            <label className="stacked-field">
              <span>Body</span>
              <textarea
                rows={4}
                value={dashboard.state.form.body}
                onChange={(event) => dashboard.setForm({ body: event.target.value })}
              />
            </label>

            <div className="blueprint-grid">
              <span className="blueprint-chip">template: {lastRequestTemplate}</span>
              <span className="blueprint-chip">targets: {dashboard.state.users.length}</span>
              <span className="blueprint-chip">request id: {lastRequest?.id ?? 'pending'}</span>
            </div>

            <div className="action-row">
              <button className="primary-button" onClick={dashboard.sendBroadcast} disabled={dashboard.state.isSending} type="button">
                {dashboard.state.isSending ? 'Sending…' : 'Send broadcast'}
              </button>
            </div>

            {dashboard.state.requestError ? <p className="error-box">{dashboard.state.requestError}</p> : null}

            {lastRequest ? (
              <div className="info-card info-card--request">
                <strong>Latest request</strong>
                <span>ID: {lastRequest.id}</span>
                <span>Status: {lastRequest.status}</span>
                <span>Created: {formatIso(lastRequest.createdAt)}</span>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="rail-stack">
          <section className="panel rail-card">
            <div className="panel-header">
              <div>
                <h2>System pulse</h2>
                <p>Backend state plus the transport bases this dashboard talks to.</p>
              </div>
            </div>

            <div className="system-card">
              <StatusLine label="Backend" value={dashboard.state.backendStatus} />
              <StatusLine label="API" value={appConfig.apiBaseUrl} mono />
              <StatusLine label="WebSocket" value={appConfig.wsBaseUrl} mono />
              {dashboard.health ? <pre className="system-json">{JSON.stringify(dashboard.health, null, 2)}</pre> : null}
            </div>
          </section>

          <section className="panel rail-card">
            <div className="panel-header">
              <div>
                <h2>Signal summary</h2>
                <p>Live counts from the current session.</p>
              </div>
            </div>

            <div className="summary-stack">
              <StatBlock label="Expected" value={dashboard.stats.expected} tone="ice" />
              <StatBlock label="Delivered" value={dashboard.stats.delivered} tone="good" />
              <StatBlock label="Fastest" value={formatLatency(dashboard.stats.fastestLatencyMs)} tone="warm" />
              <StatBlock label="Slowest" value={formatLatency(dashboard.stats.slowestLatencyMs)} tone="bad" />
            </div>
          </section>
        </aside>
      </main>

      <section className="panel lane-panel">
        <div className="panel-header">
          <div>
            <h2>Live user lanes</h2>
            <p>Each lane is an independent STOMP subscriber with its own latency history.</p>
          </div>
          <span className="panel-chip">v{__APP_VERSION__}</span>
        </div>

        {dashboard.state.broadcastBurst ? (
          <div className="fanout-burst" role="status" aria-live="polite">
            <div className="fanout-burst-copy">
              <span>Fan-out burst</span>
              <strong>request {dashboard.state.broadcastBurst.requestId.slice(0, 8)}</strong>
              <p>
                Dispatching to {dashboard.state.broadcastBurst.userCount} lanes · started {formatIso(new Date(dashboard.state.broadcastBurst.startedAt).toISOString())}
              </p>
            </div>
            <div className="fanout-burst-track" aria-hidden="true">
              {dashboard.state.users.map((user, index) => (
                <span
                  className={`fanout-burst-node ${index === 0 ? 'fanout-burst-node--hot' : ''}`}
                  key={`burst-${user.id}`}
                  style={{ '--burst-order': index } as CSSProperties}
                >
                  <span>{index + 1}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="lane-grid">
          {dashboard.state.users.map((user, index) => {
            const laneStyle = { '--lane-stagger': index } as CSSProperties;

            return (
              <article
                className={`user-card ${index === 0 ? 'user-card--featured' : ''}`}
                key={`${user.id}-${lastRequest?.id ?? 'idle'}`}
                style={laneStyle}
              >
                <div className="user-card-header">
                  <div>
                    <h3>{user.label}</h3>
                    <p className="muted break-word">{user.id}</p>
                  </div>
                  <span className="status-chip" data-state={user.status}>
                    {user.status}
                  </span>
                </div>

                <p className="muted break-word">Topic: {user.topic}</p>
                {user.statusDetail ? <p className="small-error">{user.statusDetail}</p> : null}

                <LatencySparkline deliveries={user.deliveries} />

                <div className="delivery-list">
                  {user.deliveries.length === 0 ? (
                    <p className="empty-state">Waiting for delivery…</p>
                  ) : (
                    user.deliveries.map((delivery) => (
                      <div className="delivery-item" key={delivery.id}>
                        <div className="delivery-line">
                          <strong>{delivery.summary}</strong>
                          <span>{formatLatency(delivery.latencyMs)}</span>
                        </div>
                        <div className="delivery-meta">
                          <span>Request {delivery.notificationRequestId}</span>
                          <span>{formatIso(delivery.receivedAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: 'pink' | 'blue' | 'green' | 'orange' | 'purple';
}) {
  return (
    <div className="metric-card" data-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: 'good' | 'warm' | 'bad' | 'ice';
}) {
  return (
    <div className="stat-block" data-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusLine({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="status-line">
      <span>{label}</span>
      <strong className={mono ? 'mono' : undefined}>{value}</strong>
    </div>
  );
}

function LatencySparkline({ deliveries }: { deliveries: Array<{ latencyMs: number | null }> }) {
  const values = deliveries
    .slice()
    .reverse()
    .map((delivery) => delivery.latencyMs)
    .filter((latency): latency is number => typeof latency === 'number' && Number.isFinite(latency));

  if (values.length === 0) {
    return <p className="sparkline-empty">No latency points yet</p>;
  }

  const width = 180;
  const height = 52;
  const padding = 7;

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;
  const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;

  const points = values
    .map((value, index) => {
      const x = padding + index * step;
      const ratio = (value - minValue) / range;
      const y = height - padding - ratio * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,${height - padding} ${points} ${width},${height - padding}`;
  const latest = values[values.length - 1];
  const delta = latest - values[0];
  const trendLabel = delta === 0 ? 'steady' : delta < 0 ? 'cooling' : 'warming';
  const gradientId = useId();
  const areaId = `${gradientId}-area`;
  const lineId = `${gradientId}-line`;

  return (
    <div className="sparkline-wrap">
      <div className="sparkline-head">
        <span>Latency trend</span>
        <strong>{latest} ms</strong>
      </div>
      <p className={`sparkline-legend ${delta < 0 ? 'is-good' : delta > 0 ? 'is-warm' : 'is-neutral'}`}>{trendLabel}</p>
      <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Latency trend chart">
        <defs>
          <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent-cyan)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-accent-cyan)" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id={lineId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-accent-pink)" />
            <stop offset="50%" stopColor="var(--color-accent-cyan)" />
            <stop offset="100%" stopColor="var(--color-accent-lime)" />
          </linearGradient>
        </defs>
        <polygon className="sparkline-area" fill={`url(#${areaId})`} points={areaPoints} />
        <polyline className="sparkline-line" fill="none" stroke={`url(#${lineId})`} points={points} />
      </svg>
    </div>
  );
}

export default App;
