import { Form, Popup, RadioGroup } from "devextreme-react";
import { ButtonItem, GroupItem, SimpleItem } from "devextreme-react/form";
import {
  cfgAcceptorSessionFormOptions,
  cfgInitiatorSessionFormOptions,
  cfgSessionsFilesEnum,
  cfgSessionsTypes,
} from "../handler";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { addAcceptor, addInitiator } from "../../../Services/GithubService";
import { showErrorToast, showSuccessToast } from "../../../utils/toastsService";
import { textMessages } from "../../../utils/constants";
import { booleanEnum, enumToList } from "../../../utils/helper";

const CFGSessionFormPopup = forwardRef(({ engineID, engineName, cfgPopUpVisible, setCfgPopUpVisible }, ref) => {
  const [isEdit, setIsEdit] = useState(false);
  const [cfgFormData, setCfgFormData] = useState([]);
  const addNewSessionSubmit = async (e) => {
    e?.preventDefault?.();
    let response = {};
    if (cfgPopUpVisible === cfgSessionsTypes.acceptor) {
      const data = { ...cfgFormData, ...cfgAcceptorSessionFormOptions };
      response = await addAcceptor(engineID, cfgSessionsFilesEnum.acceptor, engineName, data);
    } else if (cfgPopUpVisible === cfgSessionsTypes.initiator) {
      const data = { ...cfgFormData, ...cfgInitiatorSessionFormOptions };
      response = await addInitiator(engineID, cfgSessionsFilesEnum.initiator, engineName, data);
    }
    if (response?.isSuccessful) {
      showSuccessToast(response?.message || textMessages.sessionCreatedSuccessfully)
    } else {
      showErrorToast(response?.message || textMessages.unableToCheckConnectivity)
    }
    setCfgPopUpVisible(false);
  };

  useEffect(() => {
    setCfgFormData({ ...cfgInitiatorSessionFormOptions });
  }, []);

  useImperativeHandle(ref, () => ({
    handleSetFormData: (data) => {
      setIsEdit(true);
      setCfgFormData(data);
    },
  }));

  return (
    <Popup
      visible={!!cfgPopUpVisible}
      onHiding={() => setCfgPopUpVisible(false)}
      title={isEdit ? `EDIT ${cfgSessionsTypes?.[cfgPopUpVisible]?.toUpperCase()} SESSION` : "ADD SESSION FORM"}
      showCloseButton
      maxHeight="60vh"
      height="auto"
    >
      <div className="custom-radio-button">
        <RadioGroup
          disabled={isEdit}
          value={cfgPopUpVisible}
          dataSource={Object.values(cfgSessionsTypes || {})?.map((type) => ({
            id: type,
            value: `${type?.toUpperCase()}.CFG`,
          }))}
          displayExpr="value"
          valueExpr="id"
          layout="horizontal"
          onValueChanged={(e) => setCfgPopUpVisible(e.value)}
          itemRender={(itemData) => (
            <div className="custom-radio-item">{itemData.value}</div>
          )}
        />
      </div>
      <form action="your-action" onSubmit={addNewSessionSubmit}>
        <Form
          id="form"
          focusStateEnabled
          activeStateEnabled
          hoverStateEnabled
          showRequiredMark
          colCountByScreen={{ sm: 2, md: 4, lg: 4 }}
          formData={cfgFormData}
        >
          <SimpleItem dataField="beginString" />
          <SimpleItem
            dataField="socketAcceptPort"
            visible={cfgPopUpVisible === cfgSessionsTypes.acceptor}
            editorType="dxNumberBox"
            editorOptions={{ min: 0 }}
          />
          <SimpleItem dataField="senderCompID" />
          <SimpleItem dataField="targetCompID" />
          <SimpleItem dataField="fileStorePath" isRequired />
          <SimpleItem
            dataField="fileLogPath"
            isRequired
            visible={cfgPopUpVisible === cfgSessionsTypes.acceptor}
          />
          <SimpleItem
            dataField="timestampPrecision"
            isRequired
            visible={cfgPopUpVisible === cfgSessionsTypes.acceptor}
            editorType="dxNumberBox"
            editorOptions={{ min: 0 }}
          />
          <SimpleItem
            dataField="socketConnectHost"
            isRequired
            visible={cfgPopUpVisible === cfgSessionsTypes.initiator}
          />
          <SimpleItem
            dataField="socketConnectPort"
            isRequired
            visible={cfgPopUpVisible === cfgSessionsTypes.initiator}
          />
          <SimpleItem
            dataField="heartBtInt"
            isRequired
            visible={cfgPopUpVisible === cfgSessionsTypes.initiator}
          />
          <SimpleItem
            dataField="useDataDictionary"
            visible={cfgPopUpVisible === cfgSessionsTypes.acceptor}
            editorType="dxSelectBox"
            isRequired
            editorOptions={{
              dataSource: enumToList(booleanEnum),
              valueExpr: "ID",
              displayExpr: "Name",
            }}
          />
          <SimpleItem
            dataField="checkLatency"
            editorType="dxSelectBox"
            isRequired
            editorOptions={{
              dataSource: enumToList(booleanEnum),
              valueExpr: "ID",
              displayExpr: "Name",
            }}
          />
          <SimpleItem
            dataField="resetOnLogon"
            editorType="dxSelectBox"
            isRequired
            editorOptions={{
              dataSource: enumToList(booleanEnum),
              valueExpr: "ID",
              displayExpr: "Name",
            }}
          />
          <SimpleItem
            dataField="resetOnDisconnect"
            visible={cfgPopUpVisible === cfgSessionsTypes.acceptor}
            editorType="dxSelectBox"
            isRequired
            editorOptions={{
              dataSource: enumToList(booleanEnum),
              valueExpr: "ID",
              displayExpr: "Name",
            }}
          />
          <SimpleItem
            dataField="persistMessages"
            editorType="dxSelectBox"
            isRequired
            editorOptions={{
              dataSource: enumToList(booleanEnum),
              valueExpr: "ID",
              displayExpr: "Name",
            }}
          />
          <SimpleItem
            dataField="millisecondsInTimestamp"
            visible={cfgPopUpVisible === cfgSessionsTypes.acceptor}
            editorType="dxSelectBox"
            isRequired
            editorOptions={{
              dataSource: enumToList(booleanEnum),
              valueExpr: "ID",
              displayExpr: "Name",
            }}
          />
          <SimpleItem
            dataField="requiresOrigSendingTime"
            editorType="dxSelectBox"
            isRequired
            editorOptions={{
              dataSource: enumToList(booleanEnum),
              valueExpr: "ID",
              displayExpr: "Name",
            }}
          />
          <SimpleItem
            dataField="socketNodelay"
            editorType="dxSelectBox"
            isRequired
            editorOptions={{
              dataSource: enumToList(booleanEnum),
              valueExpr: "ID",
              displayExpr: "Name",
            }}
          />
          <SimpleItem
            dataField="validateFieldsOutOfOrder"
            editorType="dxSelectBox"
            isRequired
            editorOptions={{
              dataSource: enumToList(booleanEnum),
              valueExpr: "ID",
              displayExpr: "Name",
            }}
          />
          <SimpleItem
            dataField="validateFieldsHaveValues"
            editorType="dxSelectBox"
            isRequired
            editorOptions={{
              dataSource: enumToList(booleanEnum),
              valueExpr: "ID",
              displayExpr: "Name",
            }}
          />
          <SimpleItem
            dataField="validateUserDefinedFields"
            editorType="dxSelectBox"
            isRequired
            editorOptions={{
              dataSource: enumToList(booleanEnum),
              valueExpr: "ID",
              displayExpr: "Name",
            }}
          />
          <SimpleItem
            dataField="validateRequiredFields"
            editorType="dxSelectBox"
            isRequired
            editorOptions={{
              dataSource: enumToList(booleanEnum),
              valueExpr: "ID",
              displayExpr: "Name",
            }}
          />
          <SimpleItem
            dataField="validateUnknownFields"
            editorType="dxSelectBox"
            isRequired
            editorOptions={{
              dataSource: enumToList(booleanEnum),
              valueExpr: "ID",
              displayExpr: "Name",
            }}
          />
          <SimpleItem
            dataField="validateUnknownMsgType"
            editorType="dxSelectBox"
            isRequired
            editorOptions={{
              dataSource: enumToList(booleanEnum),
              valueExpr: "ID",
              displayExpr: "Name",
            }}
          />
          <SimpleItem
            dataField="sendBufferSize"
            isRequired
            editorType="dxNumberBox"
            editorOptions={{ min: 0 }}
          />
          <SimpleItem
            dataField="recvBufferSize"
            isRequired
            editorType="dxNumberBox"
            editorOptions={{ min: 0 }}
          />
          <SimpleItem itemType="empty" colSpan={3} visible={cfgPopUpVisible === cfgSessionsTypes.initiator} />
          <ButtonItem
            itemType="button"
            verticalAlignment="bottom"
            buttonOptions={{
              text: isEdit ? 'Update' : 'Submit',
              type: "default",
              useSubmitBehavior: true,
            }}
          />
        </Form>
      </form>
    </Popup>
  );
});

export default CFGSessionFormPopup;
