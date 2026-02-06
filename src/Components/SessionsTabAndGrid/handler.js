export const sessionStatusEnum = Object.freeze({
  connected: 'CONNECTED',
  disconnected: 'DISCONNECTED',
  unavailable: 'UNAVAILABLE',
});

export const ModeChip = ({ value }) => {
  const v = (value || '').toLowerCase();
  const isInitiator = v === 'initiator';
  const label = isInitiator ? 'Initiator' : 'Acceptor';
  const iconClass = isInitiator ? 'fa-solid fa-plug' : 'fa-solid fa-tower-broadcast';
  const cls = isInitiator ? 'sg-mode-initiator' : 'sg-mode-acceptor';

  return (
    <span className={`sg-mode ${cls}`} aria-label={`Mode ${label}`} title={label}>
      <i className={`sg-mode-icon ${iconClass}`} aria-hidden="true" />
      <span className="sg-mode-text">{label}</span>
    </span>
  );
};

export const FaPlug = () => <i className="fa-solid fa-plug" aria-hidden="true" />;
export const FaLinkSlash = () => <i className="fa-solid fa-link-slash" aria-hidden="true" />;
export const FaListOl = () => <i className="fa-solid fa-list-ol" aria-hidden="true" />;
export const FaRotateRight = () => <i className="fa-solid fa-rotate-right" aria-hidden="true" />;
export const FaSliders = () => <i className="fa-solid fa-sliders" aria-hidden="true" />;
export const FaPen = () => <i className="fa-solid fa-pen" aria-hidden="true" />;
export const FaUnavailable = () => <i className="fa-solid fa-ban" aria-hidden="true" />;

// Small helpers for visuals
export const StatusBadge = ({ value }) => {
  const v = (value || '').toUpperCase();
  if (v === sessionStatusEnum?.connected) {
    return <div className="sg-status-btn"><FaPlug /></div>;
  } else if (v === sessionStatusEnum?.disconnected) {
    return <div className="sg-status-btn"><FaLinkSlash /></div>;
  } else if (v === sessionStatusEnum?.unavailable) {
    return <div className="sg-status-btn"><FaUnavailable /></div>;
  }
};

export const handleRowPrepared = ({ data, rowType, rowElement }) => {
  if (rowType !== 'data' || !data) return;
  const value = String(data?.status || '').toUpperCase();

  // Remove any old classes (when rows are re-rendered)
  rowElement?.classList?.remove?.('sg-row-connected', 'sg-row-disconnected', 'sg-row-unavailable');

  if (value === sessionStatusEnum?.connected) {
    rowElement?.classList?.add?.('sg-row-connected');
  } else if (value === sessionStatusEnum?.disconnected) {
    rowElement?.classList?.add?.('sg-row-disconnected');
  } else if (value === sessionStatusEnum?.unavailable) {
    rowElement?.classList?.add?.('sg-row-unavailable');
  }
};
