/**
 * StatusBadge — Pure CSS dot replaces emoji for cross-platform consistency.
 * Uses `role="status"` for screen-reader announcements.
 */
const StatusBadge = ({ status }) => {
  const v = (status || '').toUpperCase();
  const map = {
    CONNECTED:    { cls: 'dxl-badge-connected',    label: 'Connected'    },
    DISCONNECTED: { cls: 'dxl-badge-disconnected',  label: 'Disconnected' },
    UNAVAILABLE:  { cls: 'dxl-badge-unavailable',   label: 'Unavailable'  },
  };
  const m = map[v] || { cls: 'dxl-badge-default', label: v || 'Unknown' };
  return (
    <span
      className={`dxl-status-badge ${m.cls}`}
      role="status"
      aria-label={`Status: ${m.label}`}
    >
      <span className="dxl-dot" aria-hidden="true" />
      {m.label}
    </span>
  );
};

/**
 * ModeChip — Matches project's sg-mode convention from SessionsTabAndGrid handler.
 * Uses FontAwesome icons (fa-plug / fa-tower-broadcast) for consistency.
 */
const ModeChip = ({ mode }) => {
  const m = (mode || '').toLowerCase();
  const isInitiator = m === 'initiator';
  const label = isInitiator ? 'Initiator' : 'Acceptor';
  const cls = isInitiator ? 'dxl-mode-initiator' : 'dxl-mode-acceptor';
  const iconClass = isInitiator ? 'fa-solid fa-plug' : 'fa-solid fa-tower-broadcast';

  return (
    <span className={`dxl-mode-chip ${cls}`} aria-label={`Mode: ${label}`} title={label}>
      <i className={`dxl-mode-icon ${iconClass}`} aria-hidden="true" />
      {label}
    </span>
  );
};

/**
 * ConnectionCard — Card row for the session status grid.
 * `data-status` attribute drives the left accent-bar color via CSS.
 * `tabIndex={0}` makes cards keyboard-navigable.
 */
export const ConnectionCard = ({ data }) => {
  const { connectionID, engineName, engineID, status, mode } = data || {};
  const statusKey = (status || '').toLowerCase();

  return (
    <div
      className="dxl-card"
      role="group"
      tabIndex={0}
      data-status={statusKey}
      aria-label={`Connection ${connectionID}, ${status || 'unknown'}`}
    >
      <div className="dxl-left">
        <div className="dxl-title">
          <span className="dxl-conn-id" title={connectionID}>{connectionID}</span>
        </div>
        <div className="dxl-sub">
          <div className="d-flex gap-1">
            <span className="dxl-label">Engine</span>
            <span className="dxl-value">{engineName}</span>
          </div>
          <div className="d-flex gap-1">
            <span className="dxl-label">ID</span>
            <span className="dxl-value dxl-mono">{engineID}</span>
          </div>
        </div>
      </div>

      <div className="dxl-right">
        <StatusBadge status={status} />
        <ModeChip mode={mode} />
      </div>
    </div>
  );
};

/**
 * EmptyState — Matches project's sess-empty-state convention.
 * Uses FontAwesome icon inside a circular container.
 */
export const EmptyState = () => (
  <div className="dxl-empty-state" role="status" aria-label="No session data available">
    <div className="dxl-empty-icon" aria-hidden="true">
      <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: 24 }} />
    </div>
    <span className="dxl-empty-title">No sessions yet</span>
    <span className="dxl-empty-desc">
      Session updates will appear here in real time once engines connect.
    </span>
  </div>
);

/**
 * LoadingSkeleton — Shimmer placeholder while data loads.
 */
export const LoadingSkeleton = ({ count = 5 }) => (
  <div className="dxl-skeleton" aria-busy="true" aria-label="Loading sessions">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="dxl-skeleton-card" />
    ))}
  </div>
);
