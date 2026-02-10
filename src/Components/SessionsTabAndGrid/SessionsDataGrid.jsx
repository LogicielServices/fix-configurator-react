import { useState, useMemo } from "react";
import {
  connectFixSession,
  disconnectFixSession,
  resetSequenceFixSession,
} from "../../Services/FixSessionService";
import useClientUpdates from "../../SignalR/useClientUpdates";
import { confirm } from "devextreme/ui/dialog";
import { textMessages } from "../../utils/constants.js";
import { Form, Popup } from "devextreme-react";
import { setSequenceFixSession } from "../../Services/FixSessionService.js";
import { ButtonItem, SimpleItem } from "devextreme-react/form.js";
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

export default function SessionsDataGrid({
  engineID,
  sessions,
  setSelectedSessionID,
}) {
  const { updates, dataGridRef } = useClientUpdates(engineID, sessions);
  const [seqNumPopUp, setSeqNumPopUp] = useState(false);

  const seqInOutSubmit = async (e) => {
    e?.preventDefault?.();
    await setSequenceFixSession(
      engineID,
      seqNumPopUp?.connectionID,
      seqNumPopUp?.inSeqNum,
      seqNumPopUp?.outSeqNum,
    );
    setSeqNumPopUp(false);
  };

  const connectEngine = async ({ row }) => {
    const result = await confirm(textMessages?.areYouSure, "Connect FIX");
    if (result) connectFixSession(engineID, row?.data?.connectionID);
  };
  const disconnectEngine = async ({ row }) => {
    const result = await confirm(textMessages?.areYouSure, "Disconnect FIX");
    if (result) disconnectFixSession(engineID, row?.data?.connectionID);
  };
  const resetSequence = async ({ row }) => {
    const result = await confirm(textMessages?.areYouSure, "Reset Sequence");
    if (result) resetSequenceFixSession(engineID, row?.data?.connectionID);
  };
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
        <form action="your-action" onSubmit={seqInOutSubmit}>
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
    );
  }, [seqNumPopUp]);

  const sessionsDataGridComponent = useMemo(() => {
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
          if (!engineID && !sessions) return;
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
        <Scrolling
          showScrollbar="onHover"
          mode="standard"
          columnRenderingMode="virtual"
        />
        <Editing
          mode="popup"
          allowUpdating={engineID && sessions}
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
        <Column dataField="connectionID" caption="ConnectionID" />
        {!engineID && !sessions ? (
          <Column dataField="engineName" caption="Engine" />
        ) : (
          [
            <Column
              key="senderCompID"
              dataField="senderCompID"
              caption="Sender CompID"
            />,
            <Column
              key="targetCompID"
              dataField="targetCompID"
              caption="Target CompID"
            />,
            <Column
              key="inSeqNum"
              dataField="inSeqNum"
              caption="InSeqNum"
              alignment="center"
              dataType="number"
            />,
            <Column
              key="outSeqNum"
              dataField="outSeqNum"
              caption="OutSeqNum"
              alignment="center"
              dataType="number"
            />,
          ]
        )}
        <Column
          dataField="status"
          caption="Status"
          alignment="center"
          cellRender={(c) => <StatusBadge value={c.data.status} />}
        />
        {engineID && sessions && (
          <Column
            dataField="lastUpdated"
            caption="Last updated"
            dataType="datetime"
          />
        )}
        <Column
          dataField="mode"
          caption="Mode"
          alignment="center"
          cellRender={(c) => <ModeChip value={c.data.mode} />}
        />
        {engineID && sessions && (
          <Column
            type="buttons"
            caption="Actions"
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
              visible={({ row }) =>
                row?.data?.status === sessionStatusEnum.disconnected
              }
            />

            {/* Disconnect */}
            <Button
              hint="Disconnect"
              onClick={disconnectEngine}
              cssClass="sg-action-btn"
              render={FaLinkSlash}
              visible={({ row }) =>
                row?.data?.status === sessionStatusEnum?.connected
              }
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
              visible={({ row }) =>
                row?.data?.status === sessionStatusEnum.disconnected
              }
            />

            {/* Reset sequence */}
            <Button
              hint="Reset sequence"
              onClick={resetSequence}
              cssClass="sg-action-btn"
              render={FaRotateRight}
              visible={({ row }) =>
                row?.data?.status === sessionStatusEnum.disconnected
              }
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
        )}

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

  return (
    <div>
      {sequenceIdsFormPopUp}
      {sessionsDataGridComponent}
    </div>
  );
}
