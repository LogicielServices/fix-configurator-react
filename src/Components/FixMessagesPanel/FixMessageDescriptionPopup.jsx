import { Form, Popup, TagBox } from "devextreme-react";
import {
  ButtonItem,
  GroupItem,
  Label,
  PatternRule,
  SimpleItem,
} from "devextreme-react/form";
import { useRef, useEffect, useState } from "react";
import { reportEmailsValidation } from "../../utils/formValidator";
import { showErrorToast, showSuccessToast } from "../../utils/toastsService";
import { textMessages } from "../../utils/constants";
import { getConnectedEngines } from "../../Services/FixSessionService";
import { fixMessageDescriptionFormOptions } from "./handler";
import { getTagvaluepairfilters, saveFixMessageDescription } from "../../Services/FixFiltersService";

const FixMessageDescriptionPopup = ({
  engineID,
  sessionID,
  fixMessageDescriptionPopupVisible,
  setFixMessageDescriptionPopupVisible,
}) => {
  const formRef = useRef();
  const [formData, setFormData] = useState({ ...fixMessageDescriptionFormOptions });
  const [enginesList, setEnginesList] = useState([]);
  const [sessionsList, setSessionsList] = useState([]);
  const [fixTagsList, setFixTagsList] = useState([]);
  const [fixValuesList, setFixValuesList] = useState([]);

  useEffect(() => {
    loadEngines();
    getFixTagValues();
  }, []);

  useEffect(() => {
    // Set default engine and session from props
    if (engineID && sessionID) {
      setFormData((prev) => ({
        ...prev,
        engine: engineID,
        sessionId: sessionID,
      }));
    }
  }, [engineID, sessionID, fixMessageDescriptionPopupVisible]);

  const loadEngines = async () => {
    const response = await getConnectedEngines();
    if (Array.isArray(response) && response?.length) {
      setEnginesList(response);
    } else {
      setEnginesList([]);
    }
  };

  const getFixTagValues = async () => {
    const response = await getTagvaluepairfilters(); // Replace with actual API call
    const tagValues = Object.entries(response || {}).map(([tag, values]) => ({
      tag,
      values,
    }));
    setFixTagsList(tagValues || []);
  };

  const addEmail = (key) => {
    formRef?.current?.instance?.focus();
    formRef.current.instance.getEditor(key).focus();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    if (!formData?.toEmails?.length) {
      formRef.current.instance.getEditor("toEmails").option("isValid", false);
      showErrorToast("To Emails is required");
      return;
    }

    if (!formData?.ccEmails?.length) {
      setFormData((prev) => ({
        ...prev,
        ccEmails: [],
      }));
    }

    const toEmails = formData?.toEmails?.join(",") || "";
    const ccEmails = formData?.ccEmails?.join(",") || "";
  
    const response = await saveFixMessageDescription({ ...formData, toEmails, ccEmails });
    if (response?.isSuccessful) {
      showSuccessToast(response?.message);
      setFixMessageDescriptionPopupVisible(false);
      return;
    }
    showErrorToast(response?.message || textMessages?.anErrorOccurred);
  };

  return (
    <Popup
      visible={!!fixMessageDescriptionPopupVisible}
      onHiding={() => {
        setFormData({ ...fixMessageDescriptionFormOptions });
        setFixMessageDescriptionPopupVisible(false);
        formRef.current?.instance?.getEditor?.("toEmails")?.option?.("isValid", true);
      }}
      title="FIX MESSAGE DESCRIPTION"
      showCloseButton
      width="500px"
      maxWidth="70vw"
      height="auto"
      maxHeight="800px"
    >
      <form onSubmit={handleSubmit}>
        <Form
          ref={formRef}
          colCount={2}
          formData={formData}
          onFieldDataChanged={(e) => {
            if (e?.dataField === "engine" && e?.value) {
              const selectedEngine = enginesList?.find((engine) => engine?.engineName === e?.value);
              setSessionsList(selectedEngine?.sessions || []);
            } else if (e?.dataField === "fixTag" && e?.value) {
              const selectedValues = fixTagsList?.find((tag) => tag?.tag === e?.value) || [];
              const valuesDataSource = selectedValues?.values?.map((value) => ({ value })) || [];
              setFixValuesList(valuesDataSource);
              setFormData((prev) => ({
                ...prev,
                fixValue: undefined, // Reset fix value when tag changes
              }));
            }
          }}
        >
          <SimpleItem
            colSpan={1}
            isRequired
            dataField="engine"
            editorType="dxSelectBox"
            editorOptions={{
              dataSource: enginesList,
              displayExpr: "engineName",
              valueExpr: "engineName",
              searchEnabled: true,
              placeholder: "Select Engine",
            }}
          >
            <Label text="Engine" />
          </SimpleItem>

          <SimpleItem
            colSpan={1}
            isRequired
            dataField="sessionId"
            editorType="dxSelectBox"
            editorOptions={{
              dataSource: sessionsList,
              displayExpr: "connectionID",
              valueExpr: "connectionID",
              searchEnabled: true,
              placeholder: "Select Session ID",
            }}
          >
            <Label text="Session Id" />
          </SimpleItem>

          <SimpleItem
            colSpan={1}
            isRequired
            dataField="fixTag"
            editorType="dxSelectBox"
            editorOptions={{
              dataSource: fixTagsList,
              displayExpr: "tag",
              valueExpr: "tag",
              searchEnabled: true,
              placeholder: "Select Fix Tag",
            }}
          >
            <Label text="Fix Tag" />
          </SimpleItem>

          <SimpleItem
            colSpan={1}
            isRequired
            dataField="fixValue"
            editorType="dxSelectBox"
            editorOptions={{
              placeholder: "Select Fix Value",
              dataSource: fixValuesList,
              displayExpr: "value",
              valueExpr: "value",
            }}
          >
            <Label text="Fix Value" />
          </SimpleItem>

          <SimpleItem
            colSpan={1}
            editorType="dxCheckBox"
            dataField="emailStatus"
            label={{ alignment: 'left', showColon: true }}
          >
            <Label text="Email Status" />
          </SimpleItem>

          <SimpleItem colSpan={1} />

          <SimpleItem
            colSpan={2}
            dataField="toEmails"
            editorType="dxTagBox"
            helpText='Hint: Use "," to provide multiple emails'
            isRequired
            editorOptions={{
              selectedItems: formData?.toEmails || [],
              acceptCustomValue: true,
              openOnFieldClick: false,
              onValueChanged: (e) => {
                if (e?.value?.find?.((x) => x?.includes?.(",") )) {
                  setFormData((prev) => ({
                    ...prev,
                    toEmails: e?.value
                      ?.join?.(",")
                      ?.split?.(",")
                      ?.filter?.((val) => val),
                  }));
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
              selectedItems: formData?.ccEmails || [],
              acceptCustomValue: true,
              openOnFieldClick: false,
              onValueChanged: (e) => {
                if (e?.value?.find?.((x) => x?.includes?.(",") )) {
                  setFormData((prev) => ({
                    ...prev,
                    ccEmails: e?.value
                      ?.join?.(",")
                      ?.split?.(",")
                      ?.filter?.((val) => val),
                  }));
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
            <Label text="CC Emails" />
            <PatternRule {...reportEmailsValidation} />
          </SimpleItem>

          <SimpleItem isRequired colSpan={2} dataField="subject">
            <Label text="Email Subject" />
          </SimpleItem>

          <SimpleItem
            isRequired
            editorType="dxTextArea"
            colSpan={2}
            dataField="body"
          >
            <Label text="Email Body" />
          </SimpleItem>

          <GroupItem colSpan={2} colCount={12}>
            <SimpleItem colSpan={6} />
            <ButtonItem
              itemType="button"
              verticalAlignment="bottom"
              colSpan={6}
              buttonOptions={{
                text: "Save",
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

export default FixMessageDescriptionPopup;
