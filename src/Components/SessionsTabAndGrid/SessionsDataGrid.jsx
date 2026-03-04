import { useState, useMemo, useEffect, useRef } from "react";
import {
  connectFixSession,
  disconnectFixSession,
  resetSequenceFixSession,
} from "../../Services/FixSessionService";
import useClientUpdates from "../../SignalR/useClientUpdates";
import { confirm } from "devextreme/ui/dialog";
import { textMessages } from "../../utils/constants.js";
import { CheckBox, Form, Popup, RadioGroup, SelectBox, TextArea } from "devextreme-react";
import { setSequenceFixSession } from "../../Services/FixSessionService.js";
import { ButtonItem, GroupItem, SimpleItem } from "devextreme-react/form";
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
  osList,
  clonableGitFilesEnum,
  editSessionRowFields,
  cfgSessionsFilesEnum,
} from "./handler.js";
import { Button as DevBtn } from "devextreme-react/button";
import CFGSessionFormPopup from "./PopupComponents/CFGSessionFormPopup.jsx";
import { deleteJenkinsConfig, getJenkinsAgents, getJenkinsConfig, getJobStatus, triggerJenkins, upsertJenkinsConfig } from "../../Services/JenkinsConfigService.js";
import { showErrorToast, showSuccessToast } from "../../utils/toastsService.js";
import { getBranches, getConfigDetails, getSessionDetail, updateCfgIni } from "../../Services/GithubService.js";

export default function SessionsDataGrid({
  engineID,
  sessions,
  engineName,
  setSelectedSessionID,
}) {
  const { updates, dataGridRef } = useClientUpdates(engineID, sessions);
  const [seqNumPopUp, setSeqNumPopUp] = useState(false);
  const [cfgPopUpVisible, setCfgPopUpVisible] = useState(false);
  const [jenkinsConfigPopUpVisible, setJenkinsConfigPopUpVisible] =
    useState(false);
  const [cloneGitHubFilePopupVisible, setCloneGitHubFilePopupVisible] = useState(false);
  const [jenkinsConfigFormData, setJenkinsConfigFormData] = useState({});
  const [jobConfigPopUpVisible, setJobConfigPopUpVisible] = useState(false);
  const [jobConfigFormData, setJobConfigFormData] = useState({});
  const [gitHubBranches, setGitHubBranches] = useState([]);
  const [jenkinsAgents, setJenkinsAgents] = useState([]);
  const [configJson, setConfigJson] = useState('');
  const [storeIni, setStoreIni] = useState('');
  const cfgSessionFormPopupRef = useRef();
  const [editSessionsRowState, setEditSessionsRowState] = useState({
    fields: [],
    data: {},
  });

  const getGitHubBranchesData = async () => {
    const data = await getBranches();
    setGitHubBranches(data || []);
  }

  const getJenkinAgentsData = async () => {
    const response = await getJenkinsAgents();
    const data = response?.computer?.map?.(x => x?.displayName);
    setJenkinsAgents(data || []);
  }

  useEffect(() => {
    getJenkinAgentsData();
    getGitHubBranchesData();
  }, [])

  const addJenkinsConfig = async (e) => {
    e?.preventDefault?.();
    const response = await upsertJenkinsConfig({ ...jenkinsConfigFormData });
    if (response?.isSuccess) {
      showSuccessToast(
        response?.message ||
          textMessages?.jenkinsConfigurationsWereSavedSuccessfully,
      );
      setJenkinsConfigPopUpVisible(false);
      return;
    }
    showErrorToast(
      response?.message || textMessages?.errorInSavingJenkinsConfig,
    );
  };

  const handleDeleteJenkinsConfig = async (e) => {
    e?.preventDefault?.();
    const response = await deleteJenkinsConfig(engineID);
    if (response?.isSuccess) {
      showSuccessToast(response?.message);
      return;
    }
    showErrorToast(response?.message || textMessages?.anErrorOccurred);
  }

  const triggerJob = async (e) => {
    e?.preventDefault?.();
    const response = await triggerJenkins(jobConfigFormData?.githubBranch, jobConfigFormData?.environment, engineID);
    console.log(jobConfigFormData, response)
    if (response?.isSuccess) {
      showSuccessToast(response?.message);
      return;
    }
    showErrorToast(response?.message || textMessages?.anErrorOccurred);
  }

  const checkJobStatus = async () => {
    const response = await getJobStatus(jobConfigFormData?.jenkinsAgentName);
    console.log(response)
    if (response?.isSuccess) {
      showSuccessToast(response?.message);
      return;
    }
    showErrorToast(response?.message || textMessages?.anErrorOccurred);
  }

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

  const jenkinsConfigPopUp = useMemo(() => {
    return (
      <Popup
        visible={!!jenkinsConfigPopUpVisible}
        onHiding={() => {
          setJenkinsConfigFormData({ ...jenkinsConfigFormOptions });
          setJenkinsConfigPopUpVisible(false);
        }}
        title="JENKINS CONFIGURATION"
        showCloseButton
        width="800px"
        maxWidth="70vw"
        maxHeight="410px"
      >
        <form action="your-action" onSubmit={addJenkinsConfig}>
          <Form colCount={2} formData={jenkinsConfigFormData}>
            <SimpleItem
              dataField="engineID"
              visible={false}
              editorOptions={{ disabled: true, value: engineID }}
            />
            <SimpleItem
              dataField=""
              label={{ text: 'Engine Name' }}
              editorOptions={{ disabled: true, value: engineName }}
            />
            <SimpleItem
              dataField="engineIP"
              label={{ text: "Fix Engine" }}
              editorOptions={{ disabled: true, value: engineID?.split?.(':')?.[0] }}
            />
            <SimpleItem isRequired dataField="fixEngineMachineUsername" />
            <SimpleItem isRequired dataField="fixEngineMachinePassword" />
            <SimpleItem
              isRequired
              dataField="jenkinsAgentName"
              label={{ text: "Jenkins Agent" }}
              editorType="dxSelectBox"
              editorOptions={{
                dataSource: jenkinsAgents,
                searchEnabled: true,
                dropDownOptions: { height: 400 }
              }}
            />
            <SimpleItem
              isRequired
              dataField="path"
              label={{ text: 'Fix Engine Path' }}
            />
            <SimpleItem
              isRequired
              dataField="fixEngineGitHubBranch"
              label={{ text: "GitHub Branch" }}
              editorType="dxSelectBox"
              editorOptions={{
                dataSource: gitHubBranches,
                searchEnabled: true,
                dropDownOptions: { height: 400 }
              }}
            />
            <SimpleItem isRequired dataField="s3BucketLogPath" />
            <GroupItem colSpan={2} colCount={12}>
              <SimpleItem colSpan={6} />
              <ButtonItem
                itemType="button"
                verticalAlignment="bottom"
                colSpan={3}
                cssClass="pr-0 pe-0"
                buttonOptions={{
                  text: "Save",
                  type: "default",
                  useSubmitBehavior: true,
                  width: "100%",
                }}
              />
              <ButtonItem
                itemType="button"
                verticalAlignment="bottom"
                colSpan={3}
                buttonOptions={{
                  text: "Delete",
                  type: "danger",
                  useSubmitBehavior: false,
                  width: "100%",
                  onClick: handleDeleteJenkinsConfig,
                }}
              />
            </GroupItem>
          </Form>
        </form>
      </Popup>
    )
  }, [jenkinsConfigFormData, jenkinsConfigPopUpVisible]);

  const triggerDeploymentPopUp = useMemo(() => {
    return (
      <Popup
        visible={!!jobConfigPopUpVisible}
        onHiding={() => {
          setJobConfigFormData({ ...jobConfigFormOptions });
          setJobConfigPopUpVisible(false);
        }}
        title="JOB CONFIGURATION"
        showCloseButton
        width="800px"
        maxWidth="70vw"
        maxHeight="410px"
      >
        <form action="your-action" onSubmit={triggerJob}>
          <Form colCount={2} formData={jobConfigFormData}>
            <SimpleItem
              dataField="engineName"
              editorOptions={{ disabled: true, value: engineName }}
            />
            <SimpleItem
              dataField="engineIp"
              label={{ text: 'Fix Engine' }}
              editorOptions={{ disabled: true, value: engineID?.split?.(':')?.[0] }}
            />
            <SimpleItem
              isRequired
              editorOptions={{ disabled: true }}
              dataField="fixEngineMachineUsername"
            />
            <SimpleItem
              isRequired
              dataField="jenkinsAgentName"
              label={{ text: "Jenkins Agent" }}
              editorType="dxSelectBox"
              editorOptions={{
                disabled: true,
                dataSource: jenkinsAgents,
                searchEnabled: true,
                dropDownOptions: { height: 400 }
              }}
            />
            <SimpleItem
              isRequired
              dataField="path"
              label={{ text: "Configurations Path" }}
              editorOptions={{ disabled: true }}
            />
            <SimpleItem
              dataField="githubBranch"
              editorType="dxSelectBox"
              editorOptions={{
                dataSource: gitHubBranches,
                searchEnabled: true,
                dropDownOptions: { height: 400 },
                showClearButton: true,
              }}
            />
            <SimpleItem
              isRequired
              dataField="environment"
              label={{ text: "Select OS" }}
              editorType="dxSelectBox"
              editorOptions={{ dataSource: osList }}
            />
            <SimpleItem itemType="empty" />
            <GroupItem colSpan={2} colCount={12}>
              <SimpleItem colSpan={6} />
              <ButtonItem
                itemType="button"
                verticalAlignment="bottom"
                colSpan={3}
                cssClass="pr-0 pe-0"
                buttonOptions={{
                  text: "Job Status",
                  type: "default",
                  useSubmitBehavior: false,
                  onClick: checkJobStatus,
                  width: "100%",
                }}
              />
              <ButtonItem
                itemType="button"
                colSpan={3}
                verticalAlignment="bottom"
                buttonOptions={{
                  text: "Trigger Job",
                  type: "default",
                  useSubmitBehavior: true,
                  width: "100%",
                }}
              />
            </GroupItem>
          </Form>
        </form>
      </Popup>
    )
  }, [jobConfigFormData, jobConfigPopUpVisible]);

  const handleJenkinsConfigPopUp = async () => {
    const data = await getJenkinsConfig(engineID);
    setJenkinsConfigPopUpVisible(true);
    setJenkinsConfigFormData({ ...jenkinsConfigFormOptions, ...data });
  }

  const handleTriggerDeploymentPopUp = async () => {
    const data = await getJenkinsConfig(engineID);
    setJobConfigPopUpVisible(true);
    setJobConfigFormData({ ...jobConfigFormOptions, ...data });
  }

  const handleEditSession = async ({ row }) => {
    const response = await getSessionDetail(engineID, cfgSessionsFilesEnum[row?.data?.mode], engineName, row?.data?.senderCompID, row?.data?.targetCompID);
    if (response?.isError) {
      showErrorToast(textMessages?.anErrorOccurred);
      return;
    }
    cfgSessionFormPopupRef?.current?.handleSetFormData?.(response);
    setCfgPopUpVisible(row?.data?.mode);
  }

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

  const handleSelectConfigJson = async () => {
    const response = await getConfigDetails(engineID, clonableGitFilesEnum.config, engineName);
    setConfigJson(JSON?.stringify?.(response) || '');
    setCloneGitHubFilePopupVisible(clonableGitFilesEnum.config);
  }

  const handleSelectStoreIni = async () => {
    const response = await getConfigDetails(engineID, clonableGitFilesEnum.store, engineName);
    setStoreIni(JSON?.stringify?.(response) || '');
    setCloneGitHubFilePopupVisible(clonableGitFilesEnum.store);
  }

  const handleConfigSubmit = async () => {
    const response = await updateCfgIni(engineID, clonableGitFilesEnum.config, engineName, configJson);
    if (response?.isSuccess) {
      showSuccessToast(response?.message);
      setCloneGitHubFilePopupVisible(false);
      return;
    }
    showErrorToast(response?.message);
  }

  const handleStoreSubmit = async () => {
    const response = await updateCfgIni(engineID, clonableGitFilesEnum.config, engineName, storeIni);
    if (response?.isSuccess) {
      showSuccessToast(response?.message);
      setCloneGitHubFilePopupVisible(false);
      return;
    }
    showErrorToast(response?.message);
  }

  const fixHubConfigurationCloneComponent = useMemo(() => {
    let content = <></>;
    switch (cloneGitHubFilePopupVisible) {
      case clonableGitFilesEnum.config:
        content = <div className="d-flex flex-column gap-3">
          <TextArea defaultValue={configJson} width={500} minHeight={500} />
          <DevBtn
            type="default"
            text={`SUBMIT ${clonableGitFilesEnum.config}`}
            onClick={handleConfigSubmit}
          />
        </div>;
        break;
      case clonableGitFilesEnum.store:
        content = <div className="d-flex flex-column gap-3">
          <TextArea defaultValue={storeIni} width={500} minHeight={500} />
          <DevBtn
            type="default"
            text={`SUBMIT ${clonableGitFilesEnum.store}`}
            onClick={handleStoreSubmit}
          />
        </div>;
        break;
      case true:
        content = <div className="d-flex flex-column gap-3 p-2">
            <DevBtn
              text={`ADD ${clonableGitFilesEnum.config}`}
              type="default"
              onClick={handleSelectConfigJson}
            />
            <DevBtn
              text={`ADD ${clonableGitFilesEnum.store}`}
              type="default"
              onClick={handleSelectStoreIni}
            />
          </div>;
        break;
      default:
        break;
    }
    return (
      <Popup
        visible={!!cloneGitHubFilePopupVisible}
        onHiding={() => setCloneGitHubFilePopupVisible(false)}
        title={`Fix Hub Configuration Clone`}
        showCloseButton
        height="auto"
        width="auto"
        maxHeight={665}
        minWidth={300}
      >
        {content}
      </Popup>
    )
  }, [cloneGitHubFilePopupVisible])

  return (
    <div>
      {fixHubConfigurationCloneComponent}
      {jenkinsConfigPopUp}
      {triggerDeploymentPopUp}
      <CFGSessionFormPopup
        ref={cfgSessionFormPopupRef}
        engineID={engineID}
        engineName={engineName}
        cfgPopUpVisible={cfgPopUpVisible}
        setCfgPopUpVisible={setCfgPopUpVisible}
      />
      {sequenceIdsFormPopUp}
      {sessionsDataGridComponent}
    </div>
  );
}
