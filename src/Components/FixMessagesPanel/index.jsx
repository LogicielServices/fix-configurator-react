import { useState, useEffect, useMemo, useRef } from "react";
import { DataGrid, Column, Paging, HeaderFilter } from "devextreme-react/data-grid";
import { Button } from "devextreme-react/button";
import { getFixMessages } from "../../Services/FixSessionService";
import { formatFixSendingTime } from "./handler";
import useFixMsgs from "../../SignalR/useFixMsgs";
import { fixMessagesList } from "../../utils/constants";
import FixMessageDescriptionPopup from "./FixMessageDescriptionPopup";
import ConfiguredFixMessagesPopup from "./ConfiguredFixMessagesPopup";

const GRID_ROW_HEIGHT = 52; // Approximate height of one row in pixels
const GRID_HEADER_HEIGHT = 90; // Approximate height of header + pager

export default function FixMessagesPanel({ engineID, sessionID }) {
  const [selectedMessagePairs, setSelectedMessagePairs] = useState([]);
  const [datasource, setDataSource] = useState([]);
  const [messagesGridHeight, setMessagesGridHeight] = useState(400);
  const [descriptionGridHeight, setDescriptionGridHeight] = useState(400);
  const [messagesPageSize, setMessagesPageSize] = useState(8);
  const [descriptionPageSize, setDescriptionPageSize] = useState(8);
  const [isResizingMessages, setIsResizingMessages] = useState(false);
  const [isResizingDescription, setIsResizingDescription] = useState(false);
  const [fixMessageDescriptionPopupVisible, setFixMessageDescriptionPopupVisible] = useState(false);
  const [configuredFixMessagesPopupVisible, setConfiguredFixMessagesPopupVisible] = useState(false);
  const { fixMsgsRef } = useFixMsgs(engineID, sessionID);
  const messagesGridRef = useRef();
  const descriptionGridRef = useRef();

  // Calculate page size based on grid height
  const calculatePageSize = (height) => {
    const availableHeight = height - GRID_HEADER_HEIGHT;
    const newPageSize = Math.max(1, Math.floor(availableHeight / GRID_ROW_HEIGHT));
    return newPageSize;
  };

  // Handle resize for messages grid
  const handleMouseDownMessages = (e) => {
    e.preventDefault();
    setIsResizingMessages(true);
  };

  // Handle resize for description grid
  const handleMouseDownDescription = (e) => {
    e.preventDefault();
    setIsResizingDescription(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingMessages && !isResizingDescription) return;

      if (isResizingMessages && messagesGridRef.current) {
        const container = messagesGridRef.current;
        const rect = container.getBoundingClientRect();
        const newHeight = e.clientY - rect.top;
        if (newHeight > 250) {
          setMessagesGridHeight(newHeight);
          setMessagesPageSize(calculatePageSize(newHeight));
        }
      }

      if (isResizingDescription && descriptionGridRef.current) {
        const container = descriptionGridRef.current;
        const rect = container.getBoundingClientRect();
        const newHeight = e.clientY - rect.top;
        if (newHeight > 250) {
          setDescriptionGridHeight(newHeight);
          setDescriptionPageSize(calculatePageSize(newHeight));
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingMessages(false);
      setIsResizingDescription(false);
    };

    if (isResizingMessages || isResizingDescription) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizingMessages, isResizingDescription]);

  // Reset description panel upon session change
  useEffect(() => {
    setSelectedMessagePairs([]);
  }, [engineID, sessionID]);

  const getData = async () => {
    if (!engineID || !sessionID) {
      setDataSource([]);
      return;
    }
    const response = await getFixMessages(engineID, sessionID);
    setDataSource(response);
    console.log(fixMsgsRef);
  };

  useEffect(() => {
    getData();
  }, [engineID, sessionID]);

  const onMessageSelection = (e) => {
    const row = e?.selectedRowsData?.[0];
    if (!row) {
      setSelectedMessagePairs([]);
      return;
    }
    setSelectedMessagePairs(row?.keyValuePair || []);
  };

  const emptyState = !engineID || !sessionID;

  const fixMessagesGrid = useMemo(() => {
    return (
      <div className="fx-card" ref={messagesGridRef} style={{ position: 'relative' }}>
        <div className="fx-card-head">
          <h4 className="fx-card-title">Fix Messages</h4>
          {engineID && sessionID ? (
            <div className="fx-card-sub">
              Engine: <b>{engineID}</b> • Session: <b>{sessionID}</b>
            </div>
          ) : (
            <div className="fx-card-sub">
              Select a session above to load messages
            </div>
          )}
        </div>

        {emptyState ? (
          <div className="fx-empty">
            <div className="fx-empty-text">No session selected</div>
          </div>
        ) : (
          <>
            <div style={{ height: `${messagesGridHeight}px`, overflow: 'hidden', position: 'relative' }}>
              <DataGrid
                ref={fixMsgsRef}
                dataSource={datasource}
                remoteOperations
                keyExpr="streamEntryId"
                columnAutoWidth
                showBorders
                width="100%"
                height="100%"
                rowAlternationEnabled
                hoverStateEnabled
                activeStateEnabled
                selection={{ mode: "single" }}
                onSelectionChanged={onMessageSelection}
                noDataText="No FIX messages found"
                allowColumnResizing
                columnResizingMode="widget"
                loadPanel={{ showIndicator: true, enabled: true, showPane: true, text: "Loading" }}
              >
                <Column
                  dataField="sessionId"
                  caption="Session ID"
                  width={200}
                  allowSorting={false}
                  allowHeaderFiltering={false}
                />
                <Column
                  dataField="sendingTime"
                  caption="Sending Time"
                  width={200}
                  allowSorting={false}
                  allowHeaderFiltering={false}
                  calculateCellValue={(row) =>
                    formatFixSendingTime(row?.sendingTime)
                  }
                />
                <Column
                  dataField="messageType"
                  caption="Message Type"
                  width={150}
                  alignment="center"
                  allowSorting={false}
                  allowHeaderFiltering
                  headerFilter={{
                    dataSource: fixMessagesList
                      .map(type => ({ value: type, text: type })),
                  }}
                />
                <Column
                  dataField="message"
                  caption="Message"
                  allowSorting={false}
                  allowHeaderFiltering={false}
                  calculateCellValue={(row) =>
                    row?.message?.replaceAll?.("\u0001", " | ")
                  }
                />
                <HeaderFilter visible />
                <Paging defaultPageSize={messagesPageSize} pageSize={messagesPageSize} />
              </DataGrid>
            </div>
            <div
              className="fx-resize-handle"
              onMouseDown={handleMouseDownMessages}
              title="Drag to resize grid height"
            />
          </>
        )}
      </div>
    );
  }, [datasource, emptyState, messagesGridHeight, messagesPageSize, fixMessagesList]);

  const fixMessagesDescriptionGrid = useMemo(() => {
    return (
      <div className="fx-card" ref={descriptionGridRef} style={{ position: 'relative' }}>
        <div className="fx-card-head">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div>
              <h4 className="fx-card-title">Fix Message Description</h4>
              <div className="fx-card-sub">Tag / Name / Value</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                icon="fa-solid fa-arrow-right-arrow-left fa-rotate-90"
                disabled={!sessionID}
                onClick={() => setConfiguredFixMessagesPopupVisible(true)}
                title="View configured fix messages streams"
              />
              <Button
                icon="fa-solid fa-gears"
                onClick={() => setFixMessageDescriptionPopupVisible(true)}
                title="Configure email notification for this message"
              />
            </div>
          </div>
        </div>
        {!selectedMessagePairs?.length ? (
          <div className="fx-empty">
            <div className="fx-empty-text">Select a message to see fields</div>
          </div>
        ) : (
          <>
            <div style={{ height: `${descriptionGridHeight}px`, overflow: 'hidden', position: 'relative' }}>
              <DataGrid
                dataSource={selectedMessagePairs}
                showBorders
                rowAlternationEnabled
                hoverStateEnabled
                columnAutoWidth
                noDataText="No fields"
                allowColumnResizing
                columnResizingMode="widget"
                width="100%"
                height="100%"
              >
                <Column
                  dataField="item1"
                  caption="Tag"
                  width="15%"
                  alignment="center"
                  dataType="number"
                />
                <Column dataField="item2" caption="Name" width="34%" />
                <Column dataField="item3" caption="Value" width="33%" />

                <Paging defaultPageSize={descriptionPageSize} pageSize={descriptionPageSize} />
              </DataGrid>
            </div>
            <div
              className="fx-resize-handle"
              onMouseDown={handleMouseDownDescription}
              title="Drag to resize grid height"
            />
          </>
        )}
      </div>
    );
  }, [selectedMessagePairs, descriptionGridHeight, descriptionPageSize]);

  return (
    <div className="fx-msgs">
      {fixMessagesGrid}
      {/* Message Description (local, paginated) */}
      {fixMessagesDescriptionGrid}
      {/* Fix Message Description Popup */}
      <FixMessageDescriptionPopup
        engineID={engineID}
        sessionID={sessionID}
        fixMessageDescriptionPopupVisible={fixMessageDescriptionPopupVisible}
        setFixMessageDescriptionPopupVisible={setFixMessageDescriptionPopupVisible}
      />
      {/* Configured Fix Messages Popup */}
      <ConfiguredFixMessagesPopup
        engineID={engineID}
        sessionID={sessionID}
        configuredFixMessagesPopupVisible={configuredFixMessagesPopupVisible}
        setConfiguredFixMessagesPopupVisible={setConfiguredFixMessagesPopupVisible}
      />
    </div>
  );
}
