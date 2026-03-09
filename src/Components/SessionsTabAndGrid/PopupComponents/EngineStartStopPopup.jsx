import { Popup, Form } from "devextreme-react";
import { SimpleItem, ButtonItem } from "devextreme-react/form";
import { forwardRef, useImperativeHandle, useState } from "react";
import { startFixEngine, stopFixEngine } from "../../../Services/JenkinsConfigService";
import { showErrorToast } from "../../../utils/toastsService";
import { reValidateSignedInUser } from "../../../Services/AccountService";

const EngineStartStopPopup = forwardRef(
  ({ action, engineID, onSuccess }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ password: "" });

    useImperativeHandle(ref, () => ({
      handleOpenPopup: () => {
        setIsVisible(true);
        setFormData({ password: "" });
        setIsLoading(false);
      },
    }));

    const handleClose = () => {
      setIsVisible(false);
      setFormData({ password: "" });
    };

    const handleAuthenticate = async () => {
      if (!formData.password) {
        showErrorToast("Please enter your password");
        return;
      }

      setIsLoading(true);
      try {
        // Step 1: Validate signed-in user with password
        const username = localStorage.getItem("username") || "";
        const authResponse = await reValidateSignedInUser(username, formData.password);

        if (!authResponse || authResponse.error) {
          showErrorToast("Authentication failed. Please check your password.");
          setIsLoading(false);
          return;
        }

        // Step 2: Call the appropriate engine control endpoint
        const engineResponse =
          action === "start"
            ? await startFixEngine(engineID)
            : await stopFixEngine(engineID);

        if (!engineResponse || engineResponse.error) {
          showErrorToast(
            `Failed to ${action} engine. Please try again.`
          );
        } else {
          // Success - close popup and call callback
          handleClose();
          if (onSuccess) {
            onSuccess();
          }
        }
      } catch (error) {
        console.error(`Error ${action}ing engine:`, error);
        showErrorToast(`An error occurred while ${action}ing engine`);
      } finally {
        setIsLoading(false);
      }
    };

    const title =
      action === "start" ? "Start Fix Engine" : "Stop Fix Engine";

    return (
      <Popup
        visible={isVisible}
        onHiding={handleClose}
        title={title}
        showCloseButton
        width="350px"
        maxWidth="85vw"
        height="auto"
        maxHeight="197px"
      >
        <Form formData={formData} colCount={1}>
          <SimpleItem
            dataField="password"
            label={{ text: "Password" }}
            editorType="dxTextBox"
            editorOptions={{
              mode: "password",
              placeholder: "Enter your password",
              disabled: isLoading,
            }}
            onValueChanged={(e) => setFormData({ password: e.value })}
          />
          <ButtonItem
            horizontalAlignment="right"
            verticalAlignment="top"
            buttonOptions={{
              text: "Authenticate",
              type: "default",
              stylingMode: "contained",
              onClick: handleAuthenticate,
              disabled: isLoading,
              useSubmitBehavior: false,
              width: "100%",
            }}
          />
        </Form>
      </Popup>
    );
  }
);

EngineStartStopPopup.displayName = "EngineStartStopPopup";

export default EngineStartStopPopup;
