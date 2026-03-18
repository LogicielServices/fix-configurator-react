import { Form, Popup, RadioGroup } from "devextreme-react";
import { ButtonItem, GroupItem, SimpleItem } from "devextreme-react/form";
import {
  cfgAcceptorSessionFormOptions,
  cfgInitiatorSessionFormOptions,
  cfgSessionsFilesEnum,
  cfgSessionsTypes,
} from "../handler.jsx";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { addAcceptor, addInitiator } from "../../../Services/GithubService";
import { showErrorToast, showSuccessToast } from "../../../utils/toastsService";
import { textMessages } from "../../../utils/constants";
import { booleanEnum, enumToList } from "../../../utils/helper";
import { useLoader } from "../../../Provider/LoaderContext.jsx";

const CFGSessionFormPopup = forwardRef(({ engineID, engineName, cfgPopUpVisible, setCfgPopUpVisible }, ref) => {
  const [isEdit, setIsEdit] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const [cfgFormData, setCfgFormData] = useState([]);
  const addNewSessionSubmit = async (e) => {
    e?.preventDefault?.();
    let response = {};
    showLoader();
    if (cfgPopUpVisible === cfgSessionsTypes.acceptor) {
      const data = { ...cfgAcceptorSessionFormOptions, ...cfgFormData };
      response = await addAcceptor(engineID, cfgSessionsFilesEnum.acceptor, engineName, data);
    } else if (cfgPopUpVisible === cfgSessionsTypes.initiator) {
      const data = { ...cfgInitiatorSessionFormOptions, ...cfgFormData };
      response = await addInitiator(engineID, cfgSessionsFilesEnum.initiator, engineName, data);
    }
    hideLoader();
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
      maxHeight="70vh"
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
          <SimpleItem dataField="beginString" editorOptions={{ placeholder: 'FIX 4.2' }} />
          <SimpleItem
            dataField="socketAcceptPort"
            visible={cfgPopUpVisible === cfgSessionsTypes.acceptor}
            editorType="dxNumberBox"
            editorOptions={{ min: 0, placeholder: '3452' }}
          />
          <SimpleItem dataField="senderCompID" editorOptions={{ placeholder: 'LINUXTESTACC' }} />
          <SimpleItem dataField="targetCompID" editorOptions={{ placeholder: 'AWSTESTINI' }} />
          <SimpleItem dataField="fileStorePath" isRequired editorOptions={{ placeholder: 'store' }} />
          <SimpleItem
            dataField="fileLogPath"
            isRequired
            visible={cfgPopUpVisible === cfgSessionsTypes.acceptor}
            editorOptions={{ placeholder: 'log' }}
          />
          <SimpleItem
            dataField="socketConnectHost"
            isRequired
            visible={cfgPopUpVisible === cfgSessionsTypes.initiator}
            editorOptions={{ placeholder: '34.209.141.204' }}
          />
          <SimpleItem
            dataField="socketConnectPort"
            isRequired
            visible={cfgPopUpVisible === cfgSessionsTypes.initiator}
            editorType="dxNumberBox"
            editorOptions={{ min: 0, placeholder: '12345' }}
          />
          <SimpleItem
            dataField="heartBtInt"
            isRequired
            visible={cfgPopUpVisible === cfgSessionsTypes.initiator}
            editorType="dxNumberBox"
            editorOptions={{ placeholder: '30' }}
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
            dataField="timestampPrecision"
            isRequired
            visible={cfgPopUpVisible === cfgSessionsTypes.acceptor}
            editorType="dxNumberBox"
            editorOptions={{ min: 0, placeholder: '0' }}
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
            editorOptions={{ min: 0, placeholder: '1048576' }}
          />
          <SimpleItem
            dataField="recvBufferSize"
            isRequired
            editorType="dxNumberBox"
            editorOptions={{ min: 0, placeholder: '1048576' }}
          />
          <SimpleItem itemType="empty" colSpan={3} visible={cfgPopUpVisible === cfgSessionsTypes.initiator} />
          <ButtonItem
            itemType="button"
            verticalAlignment="bottom"
            buttonOptions={{
              text: isEdit ? 'Update' : 'Save',
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
