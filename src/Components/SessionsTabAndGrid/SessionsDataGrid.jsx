import { useState, useMemo, useEffect, useRef } from "react";
import {
  connectFixSession,
  disconnectFixSession,
  getSessionConfiguration,
  resetSequenceFixSession,
} from "../../Services/FixSessionService";
import useClientUpdates from "../../SignalR/useClientUpdates";
import { confirm } from "devextreme/ui/dialog";
import { textMessages } from "../../utils/constants.js";
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
  Toolbar,
  Item,
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
  cfgSessionsTypes,
  jenkinsConfigFormOptions,
  jobConfigFormOptions,
  editSessionRowFields,
  cfgSessionsFilesEnum,
  FaEnvelope,
  sessionEmailConfigFormOptions,
} from "./handler.js";
import CFGSessionFormPopup from "./PopupComponents/CFGSessionFormPopup.jsx";
import SequenceNumbersPopup from "./PopupComponents/SequenceNumbersPopup.jsx";
import JenkinsConfigPopup from "./PopupComponents/JenkinsConfigPopup.jsx";
import JobDeploymentPopup from "./PopupComponents/JobDeploymentPopup.jsx";
import GitHubConfigurationPopup from "./PopupComponents/GitHubConfigurationPopup.jsx";
import { getJenkinsConfig, getJenkinsAgents } from "../../Services/JenkinsConfigService.js";
import { showErrorToast } from "../../utils/toastsService.js";
import {
  getBranches,
  getSessionDetail,
} from "../../Services/GithubService.js";
import { Button as DevBtn } from "devextreme-react/button";
import SequenceEmailConfigFormPopup from "./PopupComponents/SessionEmailConfigFormPopup.jsx";

export default function SessionsDataGrid({
  engineID,
  sessions,
  engineName,
  setSelectedSessionID,
}) {
  const { updates, dataGridRef } = useClientUpdates(engineID, sessions);

  // State Management
  const [seqNumPopUpData, setSeqNumPopUpData] = useState(null);
  const [cfgPopUpVisible, setCfgPopUpVisible] = useState(false);
  const [jenkinsConfigPopUpVisible, setJenkinsConfigPopUpVisible] =
    useState(false);
  const [cloneGitHubFilePopupVisible, setCloneGitHubFilePopupVisible] =
    useState(false);
  const [jenkinsConfigFormData, setJenkinsConfigFormData] = useState({});
  const [sessionEmailConfigFormData, setSessionEmailConfigFormData] = useState({});
  const [jobConfigPopUpVisible, setJobConfigPopUpVisible] = useState(false);
  const [sessionEmailConfigPopUpVisible, setSessionEmailConfigPopUpVisible] = useState(false);
  const [jobConfigFormData, setJobConfigFormData] = useState({});
  const [gitHubBranches, setGitHubBranches] = useState([]);
  const [jenkinsAgents, setJenkinsAgents] = useState([]);
  const [configJson, setConfigJson] = useState("");
  const [storeIni, setStoreIni] = useState("");
  const [editSessionsRowState, setEditSessionsRowState] = useState({
    fields: [],
    data: {},
  });
  const cfgSessionFormPopupRef = useRef();
  const seqNumPopupRef = useRef();

  // Fetch initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      const [branchesData, agentsResponse] = await Promise.all([
        getBranches(),
        getJenkinsAgents(),
      ]);
      setGitHubBranches(branchesData || []);
      const agentNames =
        agentsResponse?.computer?.map?.((x) => x?.displayName) || [];
      setJenkinsAgents(agentNames);
    };
    loadInitialData();
  }, []);

  // Jenkins Configuration Handlers
  const handleJenkinsConfigPopUp = async () => {
    const data = await getJenkinsConfig(engineID);
    setJenkinsConfigPopUpVisible(true);
    setJenkinsConfigFormData({
      ...jenkinsConfigFormOptions,
      ...data,
    });
  };

  const handleTriggerDeploymentPopUp = async () => {
    const data = await getJenkinsConfig(engineID);
    setJobConfigPopUpVisible(true);
    setJobConfigFormData({
      ...jobConfigFormOptions,
      ...data,
    });
  };

  const handleSessionEmailConfigsPopUp = async ({ row }) => {
    const data = await getSessionConfiguration(engineID, row?.data?.connectionID);
    if (!data?.sessionId) {
      setSessionEmailConfigFormData({ ...sessionEmailConfigFormOptions, sessionId: row?.data?.connectionID });
    } else {
      setSessionEmailConfigFormData(data);
    }
    setSessionEmailConfigPopUpVisible(true);
  };

  // Connection Handlers
  const connectEngine = async ({ row }) => {
    const result = await confirm(
      textMessages?.areYouSure,
      "Connect FIX"
    );
    if (result) connectFixSession(engineID, row?.data?.connectionID);
  };

  const disconnectEngine = async ({ row }) => {
    const result = await confirm(
      textMessages?.areYouSure,
      "Disconnect FIX"
    );
    if (result) disconnectFixSession(engineID, row?.data?.connectionID);
  };

  const resetSequence = async ({ row }) => {
    const result = await confirm(
      textMessages?.areYouSure,
      "Reset Sequence"
    );
    if (result) resetSequenceFixSession(engineID, row?.data?.connectionID);
  };

  // Session Edit Handler
  const handleEditSession = async ({ row }) => {
    const response = await getSessionDetail(
      engineID,
      cfgSessionsFilesEnum[row?.data?.mode],
      engineName,
      row?.data?.senderCompID,
      row?.data?.targetCompID
    );
    if (response?.isError) {
      showErrorToast(textMessages?.anErrorOccurred);
      return;
    }
    cfgSessionFormPopupRef?.current?.handleSetFormData?.(response);
    setCfgPopUpVisible(row?.data?.mode);
  };

  // GitHub Configuration Handlers
  const handleCloneGitHubFile = () => {
    setCloneGitHubFilePopupVisible(true);
  };

  // Data Grid Component
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
            items: editSessionsRowState?.fields,
            formData: editSessionsRowState?.data,
            colCountByScreen: { lg: 4, md: 3, sm: 2, xs: 1 },
          }}
        />
        <Toolbar>
          <Item
            location="before"
            visible={!!engineID || !!sessions}
            locateInMenu="auto"
          >
            <DevBtn
              icon="fa-solid fa-clone"
              name="Clone GitHub File"
              text="Clone GitHub File"
              type="default"
              stylingMode="contained"
              onClick={() => {
                setCloneGitHubFilePopupVisible(true);
              }}
            />
          </Item>
          <Item
            location="before"
            visible={!!engineID || !!sessions}
            locateInMenu="auto"
          >
            <DevBtn
              icon="fa-solid fa-sliders"
              name="Jenkins Configuration"
              text="Jenkins Configuration"
              stylingMode="contained"
              type="default"
              onClick={handleJenkinsConfigPopUp}
            />
          </Item>
          <Item
            location="before"
            visible={!!engineID || !!sessions}
            locateInMenu="auto"
          >
            <DevBtn
              icon="fa-solid fa-cloud-arrow-up"
              name="Trigger Deployment"
              text="Trigger Deployment"
              stylingMode="contained"
              type="default"
              onClick={handleTriggerDeploymentPopUp}
            />
          </Item>
          <Item visible={!!engineID || !!sessions}>
            <DevBtn
              icon="add"
              name="Add New Session"
              location="after"
              onClick={() => {
                setCfgPopUpVisible(cfgSessionsTypes.initiator);
              }}
            />
          </Item>
          <Item name="searchPanel" location="after" />
        </Toolbar>
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
                seqNumPopupRef?.current?.handleSetFormData?.({
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

            {/* Session email config */}
            <Button
              hint="Session Email Config"
              onClick={handleSessionEmailConfigsPopUp}
              cssClass="sg-action-btn"
              render={FaEnvelope}
            />

            {/* Edit session config */}
            <Button
              hint="Edit session config"
              onClick={(e) => {
                setEditSessionsRowState({
                  fields: editSessionRowFields,
                  data: e?.row?.data || {},
                });
                const inst = dataGridRef?.current?.instance;
                inst?.editRow?.(inst?.getRowIndexByKey?.(e?.row?.key));
              }}
              cssClass="sg-action-btn"
              render={FaSliders}
            />

            {/* Edit session */}
            <Button
              hint="Edit session"
              onClick={handleEditSession}
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
  }, [updates, editSessionsRowState]);

  // Return JSX
  return (
    <div>
      <SequenceNumbersPopup
        ref={seqNumPopupRef}
        engineID={engineID}
        seqNumPopUpData={seqNumPopUpData}
        setSeqNumPopUpData={setSeqNumPopUpData}
      />
      <JenkinsConfigPopup
        engineID={engineID}
        engineName={engineName}
        jenkinsConfigPopUpVisible={jenkinsConfigPopUpVisible}
        setJenkinsConfigPopUpVisible={setJenkinsConfigPopUpVisible}
        jenkinsConfigFormData={jenkinsConfigFormData}
        setJenkinsConfigFormData={setJenkinsConfigFormData}
        jenkinsAgents={jenkinsAgents}
        gitHubBranches={gitHubBranches}
      />
      <JobDeploymentPopup
        engineID={engineID}
        engineName={engineName}
        jobConfigPopUpVisible={jobConfigPopUpVisible}
        setJobConfigPopUpVisible={setJobConfigPopUpVisible}
        jobConfigFormData={jobConfigFormData}
        setJobConfigFormData={setJobConfigFormData}
        jenkinsAgents={jenkinsAgents}
        gitHubBranches={gitHubBranches}
      />
      <GitHubConfigurationPopup
        engineID={engineID}
        engineName={engineName}
        cloneGitHubFilePopupVisible={cloneGitHubFilePopupVisible}
        setCloneGitHubFilePopupVisible={setCloneGitHubFilePopupVisible}
        configJson={configJson}
        setConfigJson={setConfigJson}
        storeIni={storeIni}
        setStoreIni={setStoreIni}
      />
      <CFGSessionFormPopup
        ref={cfgSessionFormPopupRef}
        engineID={engineID}
        engineName={engineName}
        cfgPopUpVisible={cfgPopUpVisible}
        setCfgPopUpVisible={setCfgPopUpVisible}
      />
      <SequenceEmailConfigFormPopup
        engineID={engineID}
        engineName={engineName}
        sessionEmailConfigPopUpVisible={sessionEmailConfigPopUpVisible}
        setSessionEmailConfigPopUpVisible={setSessionEmailConfigPopUpVisible}
        sessionEmailConfigFormData={sessionEmailConfigFormData}
        setSessionEmailConfigFormData={setSessionEmailConfigFormData}
      />
      {sessionsDataGridComponent}
    </div>
  );
}
