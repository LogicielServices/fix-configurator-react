import { useState, useEffect, useMemo } from "react";
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
  Editing,
  Scrolling,
} from "devextreme-react/data-grid";
import FixMessagesPanel from "../FixMessagesPanel/index.jsx";
import "../FixMessagesPanel/index.css";
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
  sessionStatusEnum,
} from "./handler.js";
import useClientUpdates from "../../SignalR/useClientUpdates.js";
import {
  connectFixSession,
  disconnectFixSession,
  resetSequenceFixSession,
  setSequenceFixSession,
} from "../../Services/FixSessionService.js";
import { Form, Popup } from "devextreme-react";
import { ButtonItem, SimpleItem } from "devextreme-react/form.js";
import { confirm } from "devextreme/ui/dialog";
import { textMessages } from "../../utils/constants.js";

export default function SessionsGrid({ sessions, engineID }) {
  const [selectedSessionID, setSelectedSessionID] = useState(null);
  const { updates, dataGridRef } = useClientUpdates(engineID, sessions);
  const [seqNumPopUp, setSeqNumPopUp] = useState(false);

  useEffect(() => {
    setSelectedSessionID(null);
  }, [sessions]);

  const connectEngine = async ({ row }) => {
    const result = await confirm(textMessages?.areYouSure, "Connect FIX");
    if (result) connectFixSession(engineID, row?.data?.connectionID)
  }

  const disconnectEngine = async ({ row }) => {
    const result = await confirm(textMessages?.areYouSure, "Disconnect FIX");
    if (result) disconnectFixSession(engineID, row?.data?.connectionID)
  }

  const resetSequence = async ({ row }) => {
    const result = await confirm(textMessages?.areYouSure, "Reset Sequence");
    if (result) resetSequenceFixSession(engineID, row?.data?.connectionID)
  }

  const sessionsDataGrid = useMemo(() => {
    return (
      <DataGrid
        className="engine-sessions-data-grid"
        dataSource={updates || []}
        keyExpr="connectionID"
        ref={dataGridRef}
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
        selection={{ mode: "single" }}
        onSelectionChanged={(e) => {
          const row = e.selectedRowsData?.[0];
          setSelectedSessionID(row?.connectionID || null);
        }}
        onInitialized={(e) => {
          const grid = e?.component;
          grid?.option?.("searchPanel", {
            visible: true,
            width: 240,
            placeholder: "Search sessions...",
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
        <Scrolling showScrollbar="onHover" mode="standard" columnRenderingMode="virtual" />
        <Editing
          mode="popup"
          allowUpdating
          allowDeleting={false}
          allowAdding={false}
          popup={{
            title: "Session Details",
            showTitle: true,
            showCloseButton: true,
            hideOnParentScroll: false,
            toolbarItems: [],
          }}
          form={{
            disabled: true,
            items: Object.keys(updates?.[0] || {}),
            colCountByScreen: { lg: 4, md: 3, sm: 2, xs: 1 },
          }}
        />
        <Column
          dataField="connectionID"
          caption="ConnectionID"
          width={260}
        />
        <Column
          dataField="senderCompID"
          caption="Sender CompID"
          width={200}
        />
        <Column
          dataField="targetCompID"
          caption="Target CompID"
          width={200}
        />
        <Column
          dataField="inSeqNum"
          caption="InSeqNum"
          width={200}
          alignment="center"
          dataType="number"
        />
        <Column
          dataField="outSeqNum"
          caption="OutSeqNum"
          width={200}
          alignment="center"
          dataType="number"
        />
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
          width={200}
          dataType="datetime"
        />
        <Column
          dataField="mode"
          caption="Mode"
          width={200}
          alignment="center"
          cellRender={(c) => <ModeChip value={c.data.mode} />}
        />
        <Column
          type="buttons"
          caption="Actions"
          width={220}
          minWidth={220}
          fixed
          fixedPosition="right"
          alignment="center"
          cssClass="sg-actions-col"
        >
          {/* Connect */}
          <Button
            hint="Connect"
            onClick={connectEngine}
            cssClass="sg-action-btn"
            render={FaPlug}
            visible={({ row }) => row?.data?.status === sessionStatusEnum.disconnected}
          />

          {/* Disconnect */}
          <Button
            hint="Disconnect"
            onClick={disconnectEngine}
            cssClass="sg-action-btn"
            render={FaLinkSlash}
            visible={({ row }) => row?.data?.status === sessionStatusEnum?.connected}
          />

          {/* Set sequences */}
          <Button
            hint="Set sequences"
            onClick={({ row }) =>
              setSeqNumPopUp({
                connectionID: row?.data?.connectionID,
                inSeqNum: row?.data?.inSeqNum,
                outSeqNum: row?.data?.outSeqNum,
              })
            }
            cssClass="sg-action-btn"
            render={FaListOl}
            visible={({ row }) => row?.data?.status === sessionStatusEnum.disconnected}
          />

          {/* Reset sequence */}
          <Button
            hint="Reset sequence"
            onClick={resetSequence}
            cssClass="sg-action-btn"
            render={FaRotateRight}
            visible={({ row }) => row?.data?.status === sessionStatusEnum.disconnected}
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
            onClick={(e) => {
              const inst = dataGridRef?.current?.instance;
              inst?.editRow?.(inst?.getRowIndexByKey?.(e?.row?.key));
            }}
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
    );
  }, [updates]);

  const seqInOutSubmit = async (e) => {
    e?.preventDefault?.();
    await setSequenceFixSession(
      engineID,
      seqNumPopUp?.connectionID,
      seqNumPopUp?.inSeqNum,
      seqNumPopUp?.outSeqNum,
    );
    setSeqNumPopUp(false);
  }

  const sequenceIdsFormPopUp = useMemo(() => {
    return (
      <Popup
        visible={!!seqNumPopUp}
        onHiding={() => setSeqNumPopUp(false)}
        showCloseButton
        title="Set Sequences"
        width="auto"
        height="auto"
      >
        <form
          action="your-action"
          onSubmit={seqInOutSubmit}
        >
          <Form
            id="form"
            focusStateEnabled
            activeStateEnabled
            hoverStateEnabled
            showRequiredMark
          >
            <SimpleItem
              dataField="inSeqNum"
              editorType="dxNumberBox"
              editorOptions={{ min: 0 }}
            />
            <SimpleItem
              dataField="outSeqNum"
              editorType="dxNumberBox"
              editorOptions={{ min: 0 }}
            />
            <ButtonItem
              itemType="button"
              buttonOptions={{
                text: "Submit",
                type: "default",
                useSubmitBehavior: true,
              }}
            />
          </Form>
        </form>
      </Popup>
    )
  }, [seqNumPopUp])

  return (
    <div className="sg-surface p-2">
      {sequenceIdsFormPopUp}
      {sessionsDataGrid}
      <div className="sg-messages-block">
        <FixMessagesPanel engineID={engineID} sessionID={selectedSessionID} />
      </div>
    </div>
  );
}
