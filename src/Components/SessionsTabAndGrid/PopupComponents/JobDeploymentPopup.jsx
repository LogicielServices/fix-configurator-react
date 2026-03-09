import { Form, Popup } from "devextreme-react";
import { ButtonItem, GroupItem, SimpleItem } from "devextreme-react/form";
import { getJobStatus, triggerJenkins } from "../../../Services/JenkinsConfigService";
import { showErrorToast, showSuccessToast } from "../../../utils/toastsService";
import { textMessages } from "../../../utils/constants";
import { jobConfigFormOptions, osList } from "../handler";

const JobDeploymentPopup = ({
  engineID,
  engineName,
  jobConfigPopUpVisible,
  setJobConfigPopUpVisible,
  jobConfigFormData,
  setJobConfigFormData,
  jenkinsAgents,
  gitHubBranches,
}) => {
  const triggerJob = async (e) => {
    e?.preventDefault?.();
    const response = await triggerJenkins(
      jobConfigFormData?.githubBranch,
      jobConfigFormData?.environment,
      engineID
    );
    if (response?.isSuccess) {
      showSuccessToast(response?.message);
      return;
    }
    showErrorToast(response?.message || textMessages?.anErrorOccurred);
  };

  const checkJobStatus = async () => {
    const response = await getJobStatus(jobConfigFormData?.jenkinsAgentName);
    if (response?.isSuccess) {
      showSuccessToast(response?.message);
      return;
    }
    showErrorToast(response?.message || textMessages?.anErrorOccurred);
  };

  return (
    <Popup
      visible={!!jobConfigPopUpVisible}
      onHiding={() => {
        setJobConfigFormData({
          ...jobConfigFormOptions,
        });
        setJobConfigPopUpVisible(false);
      }}
      title="JOB CONFIGURATION"
      showCloseButton
      width="800px"
      maxWidth="70vw"
      maxHeight="410px"
    >
      <form onSubmit={triggerJob}>
        <Form
          colCount={2}
          formData={jobConfigFormData}
        >
          <SimpleItem
            dataField="engineName"
            editorOptions={{
              disabled: true,
              value: engineName,
            }}
          />
          <SimpleItem
            dataField="engineIp"
            label={{ text: "Fix Engine" }}
            editorOptions={{
              disabled: true,
              value: engineID?.split?.(':')?.[ 0],
            }}
          />
          <SimpleItem
            isRequired
            editorOptions={{
              disabled: true,
            }}
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
              dropDownOptions: { height: 400 },
            }}
          />
          <SimpleItem
            isRequired
            dataField="path"
            label={{ text: "Configurations Path" }}
            editorOptions={{
              disabled: true,
            }}
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
  );
};

export default JobDeploymentPopup;
