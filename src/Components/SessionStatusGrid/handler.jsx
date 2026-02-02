const StatusBadge = ({ status }) => {
  const v = (status || '').toUpperCase();
  const map = {
    CONNECTED:   { cls: 'dxl-badge-connected',    label: 'Connected',    icon: '🟢' },
    DISCONNECTED:{ cls: 'dxl-badge-disconnected', label: 'Disconnected', icon: '🔴' },
    UNAVAILABLE: { cls: 'dxl-badge-unavailable',  label: 'Unavailable',  icon: '🟠' },
  };
  const m = map[v] || { cls: 'dxl-badge-default', label: v || 'Unknown', icon: '⚪' };
  return (
    <span className={`dxl-status-badge ${m.cls}`} title={m.label} aria-label={`Status ${m.label}`}>
      <span className="dxl-dot">{m.icon}</span>
      {m.label}
    </span>
  );
};

const ModeChip = ({ mode }) => {
  const m = (mode || '').toLowerCase();
  const label = m === 'initiator' ? 'Initiator' : 'Acceptor';
  const cls = m === 'initiator' ? 'dxl-mode-initiator' : 'dxl-mode-acceptor';
  return (
    <span className={`dxl-mode-chip ${cls}`} aria-label={`Mode ${label}`}>
      {label}
    </span>
  );
};

export const ConnectionCard = ({ data }) => {
  const { connectionID, engineName, engineID, status, mode } = data || {};
  return (
    <div className="dxl-card" role="group" aria-label={`Connection ${connectionID}`}>
      <div className="dxl-left">
        <div className="dxl-title">
          <span className="dxl-conn-id">{connectionID}</span>
        </div>
        <div className="dxl-sub flex-column">
          <div className="d-flex gap-1">
            <span className="dxl-label">Engine:</span>
            <span className="dxl-value">{engineName}</span>
          </div>
          <div className="d-flex gap-1">
            <span className="dxl-label">ID:</span>
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
