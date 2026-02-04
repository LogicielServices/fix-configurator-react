import { useState, useEffect, useMemo, useRef } from "react";
import { DataGrid, Column, Paging, Pager } from "devextreme-react/data-grid";
import { getFixMessages } from "../../Services/FixSessionService";
import { formatFixSendingTime } from "./handler";
import useFixMsgs from "../../SignalR/useFixMsgs";

export default function FixMessagesPanel({ engineID, sessionID }) {
  const [selectedMessagePairs, setSelectedMessagePairs] = useState([]);
  const [datasource, setDataSource] = useState([]);
  const { fixMsgsRef } = useFixMsgs(engineID, sessionID);

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
      <div className="fx-card">
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
          <DataGrid
            ref={fixMsgsRef}
            dataSource={datasource}
            remoteOperations
            keyExpr="streamEntryId"
            columnAutoWidth
            showBorders
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
            />
            <Column
              dataField="sendingTime"
              caption="Sending Time"
              width={200}
              allowSorting={false}
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
            />
            <Column
              dataField="message"
              caption="Message"
              allowSorting={false}
              calculateCellValue={(row) =>
                row?.message?.replaceAll?.("\u0001", " | ")
              }
            />

            <Paging defaultPageSize={8} />
            <Pager
              showInfo
              showNavigationButtons
              showPageSizeSelector
              visible
              allowedPageSizes={[8, 12, 20]}
              infoText="Page {0} of {1} ({2} items)"
            />
          </DataGrid>
        )}
      </div>
    );
  }, [datasource, emptyState]);

  const fixMessagesDescriptionGrid = useMemo(() => {
    return (
      <div className="fx-card">
        <div className="fx-card-head">
          <h4 className="fx-card-title">Fix Message Description</h4>
          <div className="fx-card-sub">Tag / Name / Value</div>
        </div>
        {!selectedMessagePairs?.length ? (
          <div className="fx-empty">
            <div className="fx-empty-text">Select a message to see fields</div>
          </div>
        ) : (
          <DataGrid
            dataSource={selectedMessagePairs}
            showBorders
            rowAlternationEnabled
            hoverStateEnabled
            columnAutoWidth
            noDataText="No fields"
            allowColumnResizing
            columnResizingMode="widget"
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

            <Paging defaultPageSize={8} />
            <Pager
              showInfo
              showNavigationButtons
              showPageSizeSelector
              visible
              allowedPageSizes={[8, 12, 20]}
              infoText="Page {0} of {1} ({2} items)"
            />
          </DataGrid>
        )}
      </div>
    );
  }, [selectedMessagePairs]);

  return (
    <div className="fx-msgs">
      {fixMessagesGrid}
      {/* Message Description (local, paginated) */}
      {fixMessagesDescriptionGrid}
    </div>
  );
}
