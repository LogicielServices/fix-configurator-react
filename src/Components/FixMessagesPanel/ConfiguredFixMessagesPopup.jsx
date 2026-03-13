import { useEffect, useState } from "react";
import { getConfiguredFixMessagesStreams } from "../../Services/FixFiltersService";
import DataGrid, { Column, HeaderFilter, LoadPanel, Scrolling } from "devextreme-react/data-grid";
import { Popup } from "devextreme-react";
import moment from "moment";
import "./index.css";

const formats = [
  'YYYYMMDD-HH:mm:ss.SSS',
  'YYYYMMDD-HH:mm:ss'
];

const ConfiguredFixMessagesPopup = ({
  engineID,
  sessionID,
  configuredFixMessagesPopupVisible,
  setConfiguredFixMessagesPopupVisible,
}) => {
  const [datasource, setDatasource] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (configuredFixMessagesPopupVisible && sessionID) {
      loadConfiguredMessages();
    }
  }, [configuredFixMessagesPopupVisible, sessionID]);

  const loadConfiguredMessages = async () => {
    try {
      setLoading(true);
      const response = await getConfiguredFixMessagesStreams(sessionID);
      if (Array.isArray(response)) {
        setDatasource(response);
      } else {
        setDatasource([]);
      }
    } catch (error) {
      setDatasource([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popup
      visible={!!configuredFixMessagesPopupVisible}
      onHiding={() => {
        setConfiguredFixMessagesPopupVisible(false);
        setDatasource([]);
      }}
      title="CONFIGURED FIX MESSAGES STREAMS"
      showCloseButton
      fullScreen
    >
      {/* Styled Header Section */}
      <div className="cfg-messages-header">
        {/* Engine Info */}
        <div className="cfg-info-card">
          <div className="cfg-info-label">Engine</div>
          <div className="cfg-info-value">{engineID || 'N/A'}</div>
        </div>

        {/* Session Info */}
        <div className="cfg-info-card">
          <div className="cfg-info-label">Session ID</div>
          <div className="cfg-info-value">{sessionID || 'N/A'}</div>
        </div>
      </div>
      
      {/* Data Grid */}
      <DataGrid
        dataSource={datasource}
        showBorders
        rowAlternationEnabled
        hoverStateEnabled
        columnAutoWidth
        noDataText="No configured messages found"
        allowColumnResizing
        columnResizingMode="widget"
        width="100%"
        height="calc(100vh - 230px)"
        style={{ minHeight: 300 }}
      >
        <LoadPanel visible={loading} message="Loading..." />
        <Column
          dataField="sessionId"
          caption="Connection ID"
          width="10%"
        />
        <Column
          dataField="sendingTime"
          caption="Sending Time"
          width="10%"
          calculateDisplayValue={({ sendingTime }) =>
            moment(sendingTime, formats, true).format('YYYY-MM-DD HH:mm:ss')}
        />
        <Column
          dataField="messageType"
          caption="Message Type"
          width="10%"
          alignment="center"
        />
        <Column
          dataField="message"
          caption="Message"
          width="70%"
        />
        <Scrolling mode="virtual" />
        <HeaderFilter visible />
      </DataGrid>
    </Popup>
  );
};

export default ConfiguredFixMessagesPopup;
