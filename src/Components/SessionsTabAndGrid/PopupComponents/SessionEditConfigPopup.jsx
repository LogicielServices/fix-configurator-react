import { Popup, Form } from "devextreme-react";
import { SimpleItem } from "devextreme-react/form";
import { forwardRef, useImperativeHandle, useState } from "react";
import { editSessionRowFields } from "../handler";

// Helper function to determine field data type based on field name
const getFieldDataType = (fieldName) => {
  // Boolean fields
  if (
    [
      "validate",
      "handleResend",
      "resetConnection",
      "enableConnection",
      "dbEnabled",
      "latencyEnabled",
      "autoConnect",
      "autoReconnect",
      "logonRawData",
      "milliSecondTime",
    ].includes(fieldName)
  ) {
    return "boolean";
  }

  // Number fields (ports, latency, delays, retries)
  if (
    [
      "port",
      "backUpPort",
      "maxLatency",
      "reconnectDelay",
      "connectRetry",
    ].includes(fieldName)
  ) {
    return "number";
  }

  // DateTime fields (session start/end, task reset)
  if (["sessionStart", "sessionEnd", "taskReset"].includes(fieldName)) {
    return "datetime";
  }

  // Default to text
  return "text";
};

// Helper function to format field label
const formatFieldLabel = (fieldName) => {
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

const SessionEditConfigPopup = forwardRef(
  ({ editSessionsRowState, setEditSessionsRowState }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      handleOpenPopup: () => {
        setIsVisible(true);
      },
    }));

    const handleClose = () => {
      setIsVisible(false);
    };

    return (
      <Popup
        visible={isVisible}
        onHiding={handleClose}
        title="Session Configuration Details"
        showCloseButton
        width="900px"
        maxWidth="85vw"
        maxHeight="710px"
      >
        <Form
          formData={editSessionsRowState?.data || {}}
          colCount={3}
          colCountByScreen={{ lg: 3, md: 3, sm: 1, xs: 1 }}
        >
          {editSessionRowFields.map((fieldName) => (
            <SimpleItem
              key={fieldName}
              dataField={fieldName}
              label={{
                text: formatFieldLabel(fieldName),
                location: getFieldDataType(fieldName) === "boolean" ? "left" : "top",
                showColon: getFieldDataType(fieldName) === "boolean",
              }}
              editorType={
                getFieldDataType(fieldName) === "boolean"
                  ? "dxCheckBox"
                  : getFieldDataType(fieldName) === "datetime"
                    ? "dxDateBox"
                    : getFieldDataType(fieldName) === "number"
                      ? "dxNumberBox"
                      : "dxTextBox"
              }
              editorOptions={{
                disabled: true,
                ...(getFieldDataType(fieldName) === "datetime" && {
                  type: "datetime",
                  displayFormat: "yyyy-MM-dd HH:mm:ss",
                }),
                ...(getFieldDataType(fieldName) === "number" && {
                  showSpinButtons: false,
                }),
              }}
            />
          ))}
        </Form>
      </Popup>
    );
  }
);

SessionEditConfigPopup.displayName = "SessionEditConfigPopup";

export default SessionEditConfigPopup;
