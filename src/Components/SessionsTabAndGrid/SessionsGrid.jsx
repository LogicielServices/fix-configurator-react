import React, { useState, useEffect } from 'react';
import {
  DataGrid,
  Column,
  Paging,
  Pager,
  FilterRow,
  HeaderFilter,
  ColumnChooser,
  ColumnFixing,
  Button,
} from 'devextreme-react/data-grid';
import FixMessagesPanel from '../FixMessagesPanel/index.jsx';
import '../FixMessagesPanel/index.css';
import {
  ModeChip,
  FaPlug,
  FaLinkSlash,
  FaListOl,
  FaRotateRight,
  FaSliders,
  FaPen,
  StatusBadge,
  handleRowPrepared,
} from './handler.js';

export default function SessionsGrid({ sessions, engineID }) {
  const [datasource, setDataSource] = useState([]);
  const [selectedSessionID, setSelectedSessionID] = useState(null);

  useEffect(() => {
    setDataSource(sessions || []);
    setSelectedSessionID(null); 
  }, [sessions]);

  return (
    <div className="sg-surface p-2">
      <DataGrid
        dataSource={datasource || []}
        keyExpr="connectionID"
        showBorders
        rowAlternationEnabled={false}
        hoverStateEnabled={true}
        columnAutoWidth={true}
        wordWrapEnabled={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnResizingMode="widget"
        showColumnLines={false}
        showRowLines={false}
        noDataText="No sessions to display"
        style={{ maxHeight: 700 }}
        width="100%"
        selection={{ mode: 'single' }}
        onSelectionChanged={(e) => {
          const row = e.selectedRowsData?.[0];
          setSelectedSessionID(row?.connectionID || null);
        }}
        onInitialized={(e) => {
          const grid = e.component;
          grid.option("searchPanel", {
            visible: true,
            width: 240,
            placeholder: "Search engines…",
            highlightCaseSensitive: false,
          });
        }}
        onRowPrepared={handleRowPrepared}
        paging={{ enabled: false }}
        pager={{ visible: false }}
      >
        <FilterRow visible={true} applyFilter="auto" />
        <HeaderFilter visible={true} />
        <ColumnChooser enabled={true} mode="select" />
        <ColumnFixing enabled={true} />

        <Column dataField="connectionID" caption="ConnectionID" minWidth={160} />
        <Column dataField="senderCompID" caption="Sender CompID" minWidth={120} />
        <Column dataField="targetCompID" caption="Target CompID" minWidth={120} />
        <Column dataField="inSeqNum" caption="InSeqNum" width={100} alignment="center" dataType="number" />
        <Column dataField="outSeqNum" caption="OutSeqNum" width={110} alignment="center" dataType="number" />
        <Column
          dataField="status"
          caption="Status"
          width={150}
          alignment="center"
          cellRender={(c) => <StatusBadge value={c.data.status} />}
        />
        <Column
          dataField="lastUpdated"
          caption="Last updated"
          minWidth={180}
          dataType='datetime'
        />
        <Column
          dataField="mode"
          caption="Mode"
          width={140}
          alignment="center"
          cellRender={(c) => <ModeChip value={c.data.mode} />}
        />
        <Column
          type="buttons"
          caption="Actions"
          width={220}
          fixed
          fixedPosition="right"
          alignment="center"
          cssClass="sg-actions-col"
        >
          {/* Connect (primary) */}
          <Button
            hint="Connect"
            // onClick={(e) => onButtonClick(e, connect)}
            cssClass="sg-action-btn"
            render={FaPlug}
            visible={({ row }) => row?.data?.status === 'DISCONNECTED'}
          />

          {/* Disconnect */}
          <Button
            hint="Disconnect"
            // onClick={(e) => onButtonClick(e, disconnect)}
            cssClass="sg-action-btn"
            render={FaLinkSlash}
            visible={({ row }) => row?.data?.status === 'CONNECTED'}
          />

          {/* Set sequences */}
          <Button
            hint="Set sequences"
            // onClick={(e) => onButtonClick(e, setSequences)}
            cssClass="sg-action-btn"
            render={FaListOl}
          />

          {/* Reset sequence */}
          <Button
            hint="Reset sequence"
            // onClick={(e) => onButtonClick(e, resetSequence)}
            cssClass="sg-action-btn"
            render={FaRotateRight}
          />

          {/* Edit session config */}
          <Button
            hint="Edit session config"
            // onClick={(e) => onButtonClick(e, editSessionConfig)}
            cssClass="sg-action-btn"
            render={FaSliders}
          />

          {/* Edit session */}
          <Button
            hint="Edit session"
            // onClick={(e) => onButtonClick(e, editSession)}
            cssClass="sg-action-btn"
            render={FaPen}
          />
        </Column>

        <Paging defaultPageSize={8} />
        <Pager
          showInfo={true}
          showNavigationButtons={true}
          showPageSizeSelector={true}
          allowedPageSizes={[8, 12, 20]}
          visible={true}
          infoText="Page {0} of {1} ({2} items)"
        />
      </DataGrid>
      <div className="sg-messages-block">
        <FixMessagesPanel engineID={engineID} sessionID={selectedSessionID} />
      </div>
    </div>
  );
}
