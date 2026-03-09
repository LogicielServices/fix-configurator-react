import { Form, Popup, TagBox } from "devextreme-react";
import {
  ButtonItem,
  GroupItem,
  Label,
  PatternRule,
  SimpleItem,
} from "devextreme-react/form";
import { sessionEmailConfigFormOptions, timeUnitEnum } from "../handler";
import { reportEmailsValidation } from "../../../utils/formValidator";
import { useRef } from "react";
import { enumToList } from "../../../utils/helper";
import { deleteSessionEmailConfig, saveSessionEmailConfig } from "../../../Services/FixSessionService";
import { showErrorToast, showSuccessToast } from "../../../utils/toastsService";
import { textMessages } from "../../../utils/constants";

const SequenceEmailConfigFormPopup = ({
  engineID,
  engineName,
  sessionEmailConfigPopUpVisible,
  setSessionEmailConfigPopUpVisible,
  sessionEmailConfigFormData,
  setSessionEmailConfigFormData,
}) => {
  const formRef = useRef();
  const addEmail = (key) => {
    formRef?.current?.instance?.focus();
    formRef.current.instance.getEditor(key).focus();
  };
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!sessionEmailConfigFormData?.toEmails?.length) {
      formRef.current.instance.getEditor("toEmails").option('isValid', false);
      return;
    }
    if (!sessionEmailConfigFormData?.ccEmails?.length) {
      sessionEmailConfigFormData.ccEmails = [];
    }
    const response = await saveSessionEmailConfig(engineID, sessionEmailConfigFormData);
    if (response?.isSuccess) {
      showSuccessToast(response?.message);
      setSessionEmailConfigPopUpVisible(false);
      return;
    }
    showErrorToast(response?.message);
  };
  const deleteConfig = async (e) => {
    e?.preventDefault?.();
    const response = await deleteSessionEmailConfig(engineID, sessionEmailConfigFormData?.sessionId);
    if (!response?.isSuccess) {
      showErrorToast(response?.message || textMessages.anErrorOccurred);
      return;
    }
    showSuccessToast(response?.message);
    setSessionEmailConfigPopUpVisible(false);
  }
  return (
    <Popup
      visible={!!sessionEmailConfigPopUpVisible}
      onHiding={() => {
        setSessionEmailConfigFormData({ ...sessionEmailConfigFormOptions });
        setSessionEmailConfigPopUpVisible(false);
        formRef.current.instance.getEditor("toEmails").option('isValid', true);
      }}
      title="SESSION EMAIL CONFIGURATIONS"
      showCloseButton
      width="400px"
      maxWidth="70vw"
      height="auto"
      maxHeight="800px"
    >
      <form onSubmit={handleSubmit}>
        <Form ref={formRef} colCount={2} formData={sessionEmailConfigFormData}>
          <SimpleItem
            colSpan={2}
            isRequired
            dataField="sessionId"
            editorOptions={{ disabled: true }}
          />
          {/* <SimpleItem editorType="dxCheckBox" colSpan={1} dataField="emailStatus" /> */}
          <SimpleItem
            editorType="dxSelectBox"
            colSpan={2}
            dataField="recurring"
            editorOptions={{
              dataSource: [true, false],
              displayExpr: (value) => (value ? "Yes" : "No"),
              valueExpr: "ID",
            }}
          />
          <SimpleItem
            colSpan={2}
            dataField="toEmails"
            editorType="dxTagBox"
            helpText='Hint: Use "," to provide multiple emails'
            isRequired
            editorOptions={{
              selectedItems: sessionEmailConfigFormData?.toEmails || [],
              acceptCustomValue: true,
              openOnFieldClick: false,
              onValueChanged: (e) => {
                if (e?.value?.find?.((x) => x?.includes?.(","))) {
                  setSessionEmailConfigFormData({
                    ...sessionEmailConfigFormData,
                    toEmails: e?.value
                      ?.join?.(",")
                      ?.split?.(",")
                      ?.filter?.((val) => val),
                  });
                }
              },
              placeholder: "",
              buttons: [
                {
                  name: "Add",
                  location: "after",
                  options: {
                    stylingMode: "text",
                    icon: "plus",
                    onClick: () => {
                      addEmail("toEmails");
                    },
                  },
                },
              ],
            }}
          >
            <Label text="To Emails" />
            <PatternRule {...reportEmailsValidation} />
          </SimpleItem>
          <SimpleItem
            colSpan={2}
            dataField="ccEmails"
            editorType="dxTagBox"
            helpText='Hint: Use "," to provide multiple emails'
            editorOptions={{
              selectedItems: sessionEmailConfigFormData?.ccEmails || [],
              acceptCustomValue: true,
              openOnFieldClick: false,
              onValueChanged: (e) => {
                if (e?.value?.find?.((x) => x?.includes?.(","))) {
                  setSessionEmailConfigFormData({
                    ...sessionEmailConfigFormData,
                    ccEmails: e?.value
                      ?.join?.(",")
                      ?.split?.(",")
                      ?.filter?.((val) => val),
                  });
                }
              },
              placeholder: "",
              buttons: [
                {
                  name: "Add",
                  location: "after",
                  options: {
                    stylingMode: "text",
                    icon: "plus",
                    onClick: () => {
                      addEmail("ccEmails");
                    },
                  },
                },
              ],
            }}
          >
            <Label text="Cc Emails" />
            <PatternRule {...reportEmailsValidation} />
          </SimpleItem>
          <SimpleItem isRequired dataField="timeout" />
          <SimpleItem
            isRequired
            editorType="dxSelectBox"
            dataField="timeunit"
            editorOptions={{
              dataSource: enumToList(timeUnitEnum, 'Name', 'ID'),
              displayExpr: "Name",
              valueExpr: "ID",
            }}
          />
          <SimpleItem isRequired colSpan={2} dataField="emailSubject" />
          <SimpleItem
            isRequired
            editorType="dxTextArea"
            colSpan={2}
            dataField="emailBody"
          />
          <GroupItem colSpan={2} colCount={12}>
            <SimpleItem colSpan={4} />
            <ButtonItem
              itemType="button"
              verticalAlignment="bottom"
              colSpan={4}
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
              colSpan={4}
              buttonOptions={{
                text: "Delete",
                type: "danger",
                useSubmitBehavior: false,
                width: "100%",
                onClick: deleteConfig,
              }}
            />
          </GroupItem>
        </Form>
      </form>
    </Popup>
  );
};

export default SequenceEmailConfigFormPopup;
