import { Form, Popup } from "devextreme-react";
import { ButtonItem, GroupItem, SimpleItem } from "devextreme-react/form";
import { deleteJenkinsConfig, upsertJenkinsConfig } from "../../../Services/JenkinsConfigService";
import { showErrorToast, showSuccessToast } from "../../../utils/toastsService";
import { textMessages } from "../../../utils/constants";
import { jenkinsConfigFormOptions } from "../handler.jsx";
import { useLoader } from "../../../Provider/LoaderContext.jsx";

const JenkinsConfigPopup = ({
  engineID,
  engineName,
  jenkinsConfigPopUpVisible,
  setJenkinsConfigPopUpVisible,
  jenkinsConfigFormData,
  setJenkinsConfigFormData,
  jenkinsAgents,
  gitHubBranches,
}) => {
  const { showLoader, hideLoader } = useLoader();
  const addJenkinsConfig = async (e) => {
    e?.preventDefault?.();
    jenkinsConfigFormData.engineName = undefined;
    showLoader();
    const response = await upsertJenkinsConfig({
      ...jenkinsConfigFormData,
    });
    hideLoader();
    if (response?.isSuccess) {
      showSuccessToast(
        response?.message ||
          textMessages?.jenkinsConfigurationsWereSavedSuccessfully
      );
      setJenkinsConfigPopUpVisible(false);
      return;
    }
    showErrorToast(
      response?.message || textMessages?.errorInSavingJenkinsConfig
    );
  };

  const handleDeleteJenkinsConfig = async (e) => {
    e?.preventDefault?.();
    showLoader();
    const response = await deleteJenkinsConfig(engineID);
    hideLoader();
    if (response?.isSuccess) {
      showSuccessToast(response?.message);
      setJenkinsConfigPopUpVisible(false);
      return;
    }
    showErrorToast(response?.message || textMessages?.anErrorOccurred);
  };

  return (
    <Popup
      visible={!!jenkinsConfigPopUpVisible}
      onHiding={() => {
        setJenkinsConfigFormData({
          ...jenkinsConfigFormOptions,
        });
        setJenkinsConfigPopUpVisible(false);
      }}
      title="JENKINS CONFIGURATION"
      showCloseButton
      width="800px"
      maxWidth="70vw"
      maxHeight="425px"
    >
      <form onSubmit={addJenkinsConfig}>
        <Form
          colCount={2}
          formData={jenkinsConfigFormData}
        >
          <SimpleItem
            dataField="engineID"
            visible={false}
            editorOptions={{
              disabled: true,
              value: engineID,
            }}
          />
          <SimpleItem
            dataField="engineName"
            label={{ text: "Engine Name" }}
            editorOptions={{
              disabled: true,
              value: engineName,
            }}
          />
          <SimpleItem
            dataField="engineIP"
            label={{ text: "Fix Engine" }}
            editorOptions={{
              disabled: true,
              value: engineID?.split?.(':')?.[ 0],
            }}
          />
          <SimpleItem
            isRequired
            dataField="fixEngineMachineUsername"
          />
          <SimpleItem
            isRequired
            dataField="fixEngineMachinePassword"
            editorOptions={{ mode: 'password' }}
          />
          <SimpleItem
            isRequired
            dataField="jenkinsAgentName"
            label={{ text: "Jenkins Agent" }}
            editorType="dxSelectBox"
            editorOptions={{
              dataSource: jenkinsAgents,
              searchEnabled: true,
              dropDownOptions: { height: 400 },
            }}
          />
          <SimpleItem
            isRequired
            dataField="path"
            label={{ text: "Fix Engine Path" }}
          />
          <SimpleItem
            isRequired
            dataField="fixEngineGitHubBranch"
            label={{ text: "GitHub Branch" }}
            editorType="dxSelectBox"
            editorOptions={{
              dataSource: gitHubBranches,
              searchEnabled: true,
              dropDownOptions: { height: 400 },
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
  );
};

export default JenkinsConfigPopup;
