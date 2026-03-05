import { Popup, Form } from "devextreme-react";
import { SimpleItem } from "devextreme-react/form";
import { forwardRef, useImperativeHandle, useState } from "react";

// Helper function to format field label
const formatFieldLabel = (fieldName) => {
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

const EngineDetailsPopup = forwardRef(({ engineDetails }, ref) => {
  const [isVisible, setIsVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    handleOpenPopup: () => {
      setIsVisible(true);
    },
  }));

  const handleClose = () => {
    setIsVisible(false);
  };

  const formData = {
    engineName: engineDetails?.engineName || "",
    redisServer: `${engineDetails?.redisIpAddress || ""} : ${engineDetails?.redisIpPort || ""}`,
    redisDB: engineDetails?.redisDB || "",
    fixEngine: `${engineDetails?.fixEngineIpAddress || ""} : ${engineDetails?.fixEngineIpPort || ""}`,
    fixEngineStatus: engineDetails?.fixEngineStatus || "N/A",
  };

  return (
    <Popup
      visible={isVisible}
      onHiding={handleClose}
      title="Engine Details"
      showCloseButton
      width="400px"
      maxWidth="85vw"
      maxHeight="440px"
    >
      <Form formData={formData} colCount={1}>
        <SimpleItem
          dataField="engineName"
          label={{ text: "Engine Name" }}
          editorType="dxTextBox"
          editorOptions={{
            disabled: true,
          }}
        />
        <SimpleItem
          dataField="redisServer"
          label={{ text: "Redis Server" }}
          editorType="dxTextBox"
          editorOptions={{
            disabled: true,
          }}
        />
        <SimpleItem
          dataField="redisDB"
          label={{ text: "Redis DB" }}
          editorType="dxNumberBox"
          editorOptions={{
            disabled: true,
            showSpinButtons: false,
          }}
        />
        <SimpleItem
          dataField="fixEngine"
          label={{ text: "Fix Engine" }}
          editorType="dxTextBox"
          editorOptions={{
            disabled: true,
          }}
        />
        <SimpleItem
          dataField="fixEngineStatus"
          label={{ text: "Fix Engine Status" }}
          editorType="dxTextBox"
          editorOptions={{
            disabled: true,
          }}
        />
      </Form>
    </Popup>
  );
});

EngineDetailsPopup.displayName = "EngineDetailsPopup";

export default EngineDetailsPopup;
