import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  Toolbar,
  Item,
  SearchPanel,
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
import Form, { ButtonItem, EmptyItem, GroupItem, SimpleItem } from "devextreme-react/form";
import { confirm } from "devextreme/ui/dialog";
import { textMessages } from "../../utils/constants";
import { Popup } from "devextreme-react";
import { showErrorToast } from "../../utils/toastsService";
import { useLoader } from "../../Provider/LoaderContext";

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

const addFormDefaultData = Object.entries({
  engineName: "",
  redisIpAddress: "",
  redisIpPort: 0,
  redisDB: 0,
})

export default function EnginesGrid({ handleEngineConnected, connectedEngines, setShowPopup }) {
  const [rows, setRows] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
  const fixEngineRef = useRef();
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [addFormData, setAddFormData] = useState({ ...addFormDefaultData });
  const { showLoader, hideLoader, isLoading } = useLoader();

  const getData = async () => {
    fixEngineRef?.current?.instance?.beginCustomLoading?.();
    const response = await getAllEngines();
    setRows(response || []);
    fixEngineRef?.current?.instance?.endCustomLoading?.();
  };

  useEffect(() => {
    getData();
  }, []);

  const handleConnect = async (data, isSave = false) => {
    if (connectedEngines?.some?.(x => x?.engineID === data?.engineID)) {
      showErrorToast("Fix engine is already connected.");
      return;
    }
    const engineData = {
      engineID: data?.engineID,
      engineName: data?.engineName,
      redisIpAddress: data?.redisIpAddress,
      redisIpPort: data?.redisIpPort,
      redisDB: data?.redisDB,
      fixEngineIpAddress: data?.fixEngineIpAddress || "",
      fixEngineIpPort: data?.fixEngineIpPort || 0,
    };
    let response;
    showLoader();
    if (isSave) {
      engineData.lastReadStreamEntryID = "";
      engineData.logLastTimeStamps = "";
      engineData.fixEngineIpAddress = data?.redisIpAddress;
      response = await saveFixEngine(engineData);
    } else {
      response = await connectToFixEngine(engineData);
    }
    hideLoader();
    if (isSave && !response?.isSuccess) {
      getData?.()
        ?.then?.(() => fixEngineRef?.current?.instance?.cancelEditData?.());
    } else if (response?.StatusCode) {
      showErrorToast(textMessages?.anErrorOccurred);
      return;
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
  };

  const handleFormConnectClick = async (isSave = false) => {
    setIsFormLoading(true);
    const editingData = { ...addFormData };
    editingData.engineID = editingData?.redisIpAddress + ":" + (editingData?.redisIpPort || '0') + "::" + (editingData?.redisDB || '0');
    await handleConnect(editingData, isSave);
    setPopupVisible(false);
    setIsFormLoading(false);
  }

  const ActionCell = useCallback(({ data }) => {
    const key = data?.engineID;
    const isBusy = !!actionLoading?.[key];
    const handleDelete = async () => {
      setActionLoading((s) => ({ ...s, [key]: true }));
      const result = await confirm(textMessages?.areYouSure, "Delete Engine");
      if (result) {
        await deleteFixEngine(data?.engineID);
        getData();
      }
      setActionLoading((s) => ({ ...s, [key]: false }));
    }
    const handleConnectEngine = async () => {
      setActionLoading((s) => ({ ...s, [key]: true }));
      const result = await confirm(textMessages?.areYouSure, "Connect Engine");
      if (result) {
        await handleConnect(data);
      }
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
  }, [actionLoading]);

  const enginesConfGrid = useMemo(() => {
    return (
      <DataGrid
        dataSource={rows}
        keyExpr="engineID"
        showBorders
        ref={fixEngineRef}
        rowAlternationEnabled={true}
        hoverStateEnabled={true}
        columnAutoWidth={true}
        wordWrapEnabled={true}
        repaintChangesOnly
        renderAsync
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnResizingMode="widget"
        showColumnLines={false}
        height="63.7vh"
        width="100%"
        style={{ padding: "10px" }}
        showRowLines={false}
        noDataText="No engines to display"
      >
        {/* Filters */}
        <SearchPanel width={240} visible />
        <FilterRow visible={true} applyFilter="auto" />
        <HeaderFilter visible={true} />
        <ColumnChooser enabled={true} mode="select" />
        <ColumnFixing enabled={true} />
        <Toolbar>
          <Item>
            <Button
              id="add-row-button"
              icon="add"
              name="addRowButton"
              location="after"
              onClick={() => setPopupVisible(true)}
            />
          </Item>
          <Item name="searchPanel" location="after" />
        </Toolbar>

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
    )
  }, [rows, ActionCell])

  return (
    <div id="fix-engines-dialog">
      <div className="eng-wrap p-3">
        <div className="eng-head d-flex flex-rows justify-content-between">
          <h3 className="eng-title">Engine Configurations</h3>
          <div><Button type="back" icon="close" onClick={() => setShowPopup(false)} /></div>
        </div>
        <Popup
          title="Add or Connect Engines"
          visible={popupVisible}
          minWidth={320}
          width="auto"
          height="auto"
          showCloseButton
          onHiding={() => {
            setPopupVisible(false);
            setIsFormLoading(false);
            setAddFormData({ ...addFormDefaultData });
          }}
        >
          <form
            onSubmit={(e) => {
              e?.preventDefault?.();
              handleFormConnectClick(true);
            }}
          >
            <Form
              formData={addFormData}
              id="form"
              focusStateEnabled
              activeStateEnabled
              hoverStateEnabled
              showRequiredMark
              width="auto"
            >
              <SimpleItem
                dataField="engineName"
                editorType="dxTextBox"
                isRequired
              />
              <SimpleItem
                dataField="redisIpAddress"
                editorType="dxTextBox"
                label={{ text: "Redis IP Address" }}
                isRequired
              />
              <SimpleItem
                dataField="redisIpPort"
                editorType="dxNumberBox"
                label={{ text: "Redis Port" }}
                editorOptions={{ min: 0 }}
                isRequired
              />
              <SimpleItem
                dataField="redisDB"
                editorType="dxNumberBox"
                label={{ text: "Redis DB" }}
                editorOptions={{ min: 0 }}
                isRequired
              />
              <ButtonItem
                buttonOptions={{
                  disabled: isFormLoading,
                  width: "100%",
                  text: "Save",
                  type: "default",
                  useSubmitBehavior: true,
                }}
              />
              <ButtonItem
                buttonOptions={{
                  disabled: isFormLoading,
                  width: "100%",
                  text: "Connect",
                  type: "default",
                  onClick: () => handleFormConnectClick(),
                }}
              />
            </Form>
          </form>
        </Popup>
        <div className="eng-surface">
          {enginesConfGrid}
        </div>
      </div>
    </div>
  );
}
