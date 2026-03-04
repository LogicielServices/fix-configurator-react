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

export const cfgSessionsTypes = Object.freeze({
  initiator: 'initiator',
  acceptor: 'acceptor',
});

export const cfgSessionsFilesEnum = Object.freeze({
  initiator: 'initiator.cfg',
  acceptor: 'acceptor.cfg',
});

export const cfgInitiatorSessionFormOptions = Object.freeze({
  fileStorePath: "",
  sendBufferSize: 0,
  recvBufferSize: 0,
  socketConnectHost: "",
  socketConnectPort: "",
  heartBtInt: "",
  checkLatency: false,
  resetOnLogon: false,
  persistMessages: false,
  requiresOrigSendingTime: false,
  socketNodelay: false,
  validateFieldsOutOfOrder: false,
  validateFieldsHaveValues: false,
  validateUserDefinedFields: false,
  validateRequiredFields: false,
  validateUnknownFields: false,
  validateUnknownMsgType: false,
  beginString: "",
  senderCompID: "",
  targetCompID: "",
});

export const cfgAcceptorSessionFormOptions = Object.freeze({
  beginString: "",
  socketAcceptPort: 0,
  senderCompID: "",
  targetCompID: "",
  fileStorePath: "",
  fileLogPath: "",
  timestampPrecision: 0,
  sendBufferSize: 0,
  recvBufferSize: 0,
  useDataDictionary: false,
  millisecondsInTimestamp: false,
  validateUserDefinedFields: false,
  validateRequiredFields: false,
  requiresOrigSendingTime: false,
  checkLatency: false,
  resetOnLogon: false,
  socketNodelay: false,
  validateUnknownFields: false,
  resetOnDisconnect: false,
  validateFieldsOutOfOrder: false,
  validateUnknownMsgType: false,
  persistMessages: false,
  validateFieldsHaveValues: false,
});

export const jenkinsConfigFormOptions = Object.freeze({
  engineName: undefined,
  engineIp: undefined,
  fixEngineMachineUsername: undefined,
  fixEngineMachinePassword: undefined,
  jenkinsAgentName: undefined,
  path: undefined,
  fixEngineGitHubBranch: undefined,
  s3BucketLogPath: undefined,
});

export const jobConfigFormOptions = Object.freeze({
  fixEnginePath: undefined,
  branchName: undefined,
  environment: undefined,
})

export const osList = Object.freeze(['Linux', 'Windows']);

export const clonableGitFilesEnum = Object.freeze({
  config: "config.json",
  store: "store.ini",
})

export const editSessionRowFields = Object.freeze([
  "senderCompID",
  "targetCompID",
  "ipAddress",
  "backUpIPAddress",
  "port",
  "backUpPort",
  "validate",
  "handleResend",
  "maxLatency",
  "resetConnection",
  "enableConnection",
  "fixVersion",
  "internalFIXVersion",
  "mode",
  "dbEnabled",
  "latencyEnabled",
  "autoConnect",
  "autoReconnect",
  "reconnectDelay",
  "connectRetry",
  "logonRawData",
  "milliSecondTime",
  "sessionStart",
  "sessionEnd",
  "taskReset"
]);
