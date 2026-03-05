import { Popup, TextArea } from "devextreme-react";
import { Button as DevBtn } from "devextreme-react/button";
import { getConfigDetails, updateCfgIni } from "../../../Services/GithubService";
import { showErrorToast, showSuccessToast } from "../../../utils/toastsService";
import { clonableGitFilesEnum } from "../handler";

const GitHubConfigurationPopup = ({
  engineID,
  engineName,
  cloneGitHubFilePopupVisible,
  setCloneGitHubFilePopupVisible,
  configJson,
  setConfigJson,
  storeIni,
  setStoreIni,
}) => {
  const handleSelectConfigJson = async () => {
    const response = await getConfigDetails(
      engineID,
      clonableGitFilesEnum.config,
      engineName
    );
    setConfigJson(JSON?.stringify?.(response, null, 2) || "");
    setCloneGitHubFilePopupVisible(clonableGitFilesEnum.config);
  };

  const handleSelectStoreIni = async () => {
    const response = await getConfigDetails(
      engineID,
      clonableGitFilesEnum.store,
      engineName
    );
    setStoreIni(JSON?.stringify?.(response, null, 2) || "");
    setCloneGitHubFilePopupVisible(clonableGitFilesEnum.store);
  };

  const handleConfigSubmit = async () => {
    const response = await updateCfgIni(
      engineID,
      clonableGitFilesEnum.config,
      engineName,
      configJson
    );
    if (response?.isSuccess) {
      showSuccessToast(response?.message);
      setCloneGitHubFilePopupVisible(false);
      return;
    }
    showErrorToast(response?.message);
  };

  const handleStoreSubmit = async () => {
    const response = await updateCfgIni(
      engineID,
      clonableGitFilesEnum.store,
      engineName,
      storeIni
    );
    if (response?.isSuccess) {
      showSuccessToast(response?.message);
      setCloneGitHubFilePopupVisible(false);
      return;
    }
    showErrorToast(response?.message);
  };

  let content = <></>;

  if (cloneGitHubFilePopupVisible === clonableGitFilesEnum.config) {
    content = (
      <div className="d-flex flex-column gap-3">
        <TextArea
          defaultValue={configJson}
          width={500}
          minHeight={500}
          maxHeight={500}
          value={configJson}
          onValueChanged={(e) => setConfigJson(e)}
        />
        <DevBtn
          type="default"
          text={`SUBMIT ${clonableGitFilesEnum.config}`}
          onClick={handleConfigSubmit}
        />
      </div>
    );
  } else if (cloneGitHubFilePopupVisible === clonableGitFilesEnum.store) {
    content = (
      <div className="d-flex flex-column gap-3">
        <TextArea
          defaultValue={storeIni}
          width={500}
          minHeight={500}
          maxHeight={500}
          value={storeIni}
          onValueChanged={(e) => setStoreIni(e)}
        />
        <DevBtn
          type="default"
          text={`SUBMIT ${clonableGitFilesEnum.store}`}
          onClick={handleStoreSubmit}
        />
      </div>
    );
  } else if (cloneGitHubFilePopupVisible === true) {
    content = (
      <div className="d-flex flex-column gap-3 p-2">
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
      </div>
    );
  }

  return (
    <Popup
      visible={!!cloneGitHubFilePopupVisible}
      onHiding={() => setCloneGitHubFilePopupVisible(false)}
      title="Fix Hub Configuration Clone"
      showCloseButton
      height="auto"
      width="auto"
      maxHeight={665}
      minWidth={300}
    >
      {content}
    </Popup>
  );
};

export default GitHubConfigurationPopup;
