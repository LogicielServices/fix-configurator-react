import React, { useState, useEffect, useRef } from "react";
import {
  DataGrid,
  Column,
  Paging,
  Pager,
  FilterRow,
  HeaderFilter,
  ColumnChooser,
  ColumnFixing,
  Editing,
} from "devextreme-react/data-grid";
import Button from "devextreme-react/button";
import {
  getAllEngines,
  connectToFixEngine,
  getSessionsConnectivityStatus,
  deleteFixEngine,
  saveFixEngine,
} from "../../Services/FixSessionService";
import "./index.css";
import NumberBox from "devextreme-react/number-box";
import TextBox from "devextreme-react/text-box";
import Form, { SimpleItem } from "devextreme-react/form";

// Small chips
const DbChip = ({ db }) => <span className="eng-chip eng-db">DB {db}</span>;
const IpChip = ({ ip }) => <span className="eng-chip eng-ip">{ip}</span>;
const PortChip = ({ port }) => (
  <span className="eng-chip eng-port">{port}</span>
);

// Custom cells
const EngineCell = ({ data }) => (
  <div className="eng-engine-cell">
    <div className="eng-name">{data.engineName}</div>
    <div className="eng-sub mono">{data.engineID}</div>
  </div>
);

const AddressCell = ({ data }) => (
  <div className="eng-address-cell">
    <IpChip ip={data.redisIpAddress} />
  </div>
);

const PortCell = ({ data }) => (
  <div className="eng-address-cell">
    <PortChip port={data.redisIpPort} />
  </div>
);

const DbCell = ({ data }) => <DbChip db={data.redisDB} />;

export default function EnginesGrid({ handleEngineConnected }) {
  const [rows, setRows] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
  const fixEngineRef = useRef();

  const getData = async () => {
    const response = await getAllEngines();
    setRows(response || []);
  };

  useEffect(() => {
    getData();
  }, []);

  const handleConnect = async (data, isSave = false) => {
    const engineData = {
      engineID: data?.engineID,
      engineName: data?.engineName,
      redisIpAddress: data?.redisIpAddress,
      redisIpPort: data?.redisIpPort,
      redisDB: data?.redisDB,
      fixEngineIpAddress: data?.fixEngineIpAddress || "",
      fixEngineIpPort: data?.fixEngineIpPort || 0,
    };
    let response
    if (isSave) {
      engineData.lastReadStreamEntryID = "";
      engineData.logLastTimeStamps = "";
      engineData.fixEngineIpAddress = data?.redisIpAddress;
      response = await saveFixEngine(engineData);
    } else {
      response = await connectToFixEngine(engineData);
    }
    if (response) {
      if (isSave) {
        getData?.()
          ?.then?.(() => fixEngineRef?.current?.instance?.cancelEditData?.());
      }
      const connectivityStatuses = await getSessionsConnectivityStatus();
      const engineConnStatuses = connectivityStatuses?.filter?.(cs =>
        cs?.engineID === response?.engineID &&
        cs?.engineName === response?.engineName
      );
      const sessionsWithStatus = response?.sessions?.map?.((res) => {
        res.status = engineConnStatuses?.find?.(cs =>
          cs?.connectionID === res?.connectionID
        )?.status || res?.status;
        return res;
      });
      handleEngineConnected?.({ ...response, sessions: sessionsWithStatus });
    }
  };

  const ActionCell = ({ data }) => {
    const key = data?.engineID;
    const isBusy = !!actionLoading?.[key];

    const handleDelete = async () => {
      await deleteFixEngine(data?.engineID);
      getData();
    }

    const handleConnectEngine = async () => {
      setActionLoading((s) => ({ ...s, [key]: true }));
      await handleConnect(data);
      setActionLoading((s) => ({ ...s, [key]: false }));
    }

    return (
      <div className="eng-actions">
        <Button
          icon={isBusy ? "refresh" : "link"}
          stylingMode="contained"
          type="default"
          onClick={handleConnectEngine}
          disabled={isBusy}
          hint="Connect"
          elementAttr={{ "aria-label": isBusy ? "Connecting" : "Connect" }}
        />
        {/* Example: if you later add delete as icon-only */}
        <Button
          icon="trash"
          stylingMode="contained"
          type="danger"
          onClick={handleDelete}
          disabled={isBusy}
          hint="Delete"
          elementAttr={{ 'aria-label': 'Delete engine' }}
        />
      </div>
    );
  };

  return (
    <div id="fix-engines-dialog">
      <div className="eng-wrap p-3">
        <div className="eng-head">
          <h3 className="eng-title">Engine Configurations</h3>
        </div>

        <div className="eng-surface">
          <DataGrid
            dataSource={rows}
            keyExpr="engineID"
            showBorders
            ref={fixEngineRef}
            rowAlternationEnabled={true}
            hoverStateEnabled={true}
            columnAutoWidth={true}
            wordWrapEnabled={true}
            allowColumnReordering={true}
            allowColumnResizing={true}
            columnResizingMode="widget"
            showColumnLines={false}
            height="63.7vh"
            width="100%"
            style={{ padding: "10px" }}
            showRowLines={false}
            noDataText="No engines to display"
            // Nice, compact search across key fields
            onInitialized={(e) => {
              const grid = e.component;
              grid.option("searchPanel", {
                visible: true,
                width: 240,
                placeholder: "Search engines…",
                highlightCaseSensitive: false,
              });
            }}
          >
            {/* Filters */}
            <FilterRow visible={true} applyFilter="auto" />
            <HeaderFilter visible={true} />
            <ColumnChooser enabled={true} mode="select" />
            <ColumnFixing enabled={true} />
            <Editing
              allowAdding
              allowUpdating={false}
              allowDeleting={false}
              mode="popup"
              popup={{
                focusStateEnabled: true,
                activeStateEnabled: true,
                hoverStateEnabled: true,
                disabled: false,
                width: 500,
                height: "auto",
                title: "Add or connect Engine",
                showTitle: true,
                dragEnabled: true,
                container: '#fix-engines-dialog',
                closeOnOutsideClick: false,
                showCloseButton: true,
                toolbarItems: [
                  {
                    widget: "dxButton",
                    location: "after",
                    toolbar: "bottom",
                    options: {
                      text: 'Connect',
                      type: 'default',
                      stylingMode: 'text',
                      useSubmitBehavior: true,
                      onClick: () => {
                        const visibleRowsData = fixEngineRef?.current?.instance?.getVisibleRows?.();
                        const editingData = visibleRowsData?.find?.(x => !!x?.isEditing)?.data;
                        editingData.engineID = editingData?.redisIpAddress + ":" + editingData?.redisIpPort + "::" + editingData?.redisDB;
                        handleConnect(editingData);
                      },
                    }
                  },
                  {
                    widget: "dxButton",
                    location: "after",
                    toolbar: "bottom",
                    options: {
                      text: 'Save',
                      type: 'default',
                      stylingMode: 'text',
                      useSubmitBehavior: true,
                      onClick: () => {
                        const visibleRowsData = fixEngineRef?.current?.instance?.getVisibleRows?.()
                        const editingData = visibleRowsData?.find?.(x => !!x?.isEditing)?.data
                        editingData.engineID = editingData?.redisIpAddress + ":" + editingData?.redisIpPort + "::" + editingData?.redisDB;
                        handleConnect(editingData, true);
                      },
                    }
                  }
                ]
              }}
              form={{
                focusStateEnabled: true,
                activeStateEnabled: true,
                hoverStateEnabled: true,
                showRequiredMark: true,
                items: [
                  {
                    itemType: "simple",
                    dataField: "engineName",
                    editorType: "dxTextBox",
                    label: { text: "Name" },
                    isRequired: true,
                  },
                  {
                    itemType: "simple",
                    dataField: "redisIpAddress",
                    editorType: "dxTextBox",
                    label: { text: "Redis IP Address" },
                    isRequired: true,
                  },
                  {
                    itemType: "simple",
                    dataField: "redisIpPort",
                    editorType: "dxNumberBox",
                    label: { text: "Redis Port" },
                    editorOptions: { min: 0 },
                    isRequired: true,
                  },
                  {
                    itemType: "simple",
                    dataField: "redisDB",
                    editorType: "dxNumberBox",
                    label: { text: "Redis DB" },
                    editorOptions: { min: 0 },
                    isRequired: true,
                  },
                ],
              }}
            />

            {/* Columns */}
            <Column
              dataField="engineName"
              caption="Engine"
              width="25%"
              allowSorting={true}
              cellRender={(cell) => <EngineCell data={cell?.data} />}
            />
            <Column
              dataField="engineID"
              caption="Engine ID"
              visible={false}
              allowFiltering
            />
            <Column
              dataField="redisIpAddress"
              caption="Redis IP"
              width="25%"
              cellRender={(cell) => <AddressCell data={cell?.data} />}
              calculateFilterExpression={(value, _) => [
                "redisIpAddress",
                "contains",
                value,
              ]}
              allowSorting={true}
            />
            <Column
              dataField="redisIpPort"
              caption="Port"
              width="20%"
              alignment="center"
              allowSorting={true}
              cellRender={(cell) => <PortCell data={cell?.data} />}
            />
            <Column
              dataField="redisDB"
              caption="DB"
              width="20%"
              alignment="center"
              cellRender={(cell) => <DbCell data={cell?.data} />}
              allowSorting={true}
              dataType="number"
            />
            <Column
              caption="Actions"
              width={120}
              alignment="center"
              cellRender={(cell) => <ActionCell data={cell?.data} />}
              allowFiltering={false}
              allowSorting={false}
              fixedPosition="right"
              fixed={true}
            />

            {/* Paging */}
            <Paging defaultPageSize={5} />
            <Pager
              showInfo={true}
              showNavigationButtons={true}
              showPageSizeSelector={true}
              allowedPageSizes={[5, 10, 15]}
              visible={true}
              infoText="Page {0} of {1} ({2} items)"
            />
          </DataGrid>
        </div>
      </div>
    </div>
  );
}
