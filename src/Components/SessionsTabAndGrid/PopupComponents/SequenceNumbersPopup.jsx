import { Form, Popup } from "devextreme-react";
import { ButtonItem, SimpleItem } from "devextreme-react/form";
import { setSequenceFixSession } from "../../../Services/FixSessionService";
import { forwardRef, useImperativeHandle } from "react";
import { useLoader } from "../../../Provider/LoaderContext";

const SequenceNumbersPopup = forwardRef(({
  engineID,
  seqNumPopUpData,
  setSeqNumPopUpData,
}, ref) => {
  const { showLoader, hideLoader } = useLoader();
  const seqInOutSubmit = async (e) => {
    e?.preventDefault?.();
    showLoader();
    await setSequenceFixSession(
      engineID,
      seqNumPopUpData?.connectionID,
      seqNumPopUpData?.inSeqNum,
      seqNumPopUpData?.outSeqNum
    );
    hideLoader();
    setSeqNumPopUpData(null);
  };

  useImperativeHandle(ref, () => ({
    handleSetFormData: (data) => setSeqNumPopUpData(data),
  }));

  return (
    <Popup
      visible={!!seqNumPopUpData}
      onHiding={() => setSeqNumPopUpData(null)}
      showCloseButton
      title="Set Sequences"
      width="auto"
      height="auto"
    >
      <form onSubmit={seqInOutSubmit}>
        <Form
          id="seq-form"
          focusStateEnabled
          activeStateEnabled
          hoverStateEnabled
          showRequiredMark
          formData={seqNumPopUpData}
        >
          <SimpleItem
            dataField="inSeqNum"
            editorType="dxNumberBox"
            editorOptions={{ min: 0 }}
          />
          <SimpleItem
            dataField="outSeqNum"
            editorType="dxNumberBox"
            editorOptions={{ min: 0 }}
          />
          <ButtonItem
            itemType="button"
            buttonOptions={{
              text: "Submit",
              type: "default",
              useSubmitBehavior: true,
            }}
          />
        </Form>
      </form>
    </Popup>
  );
});

export default SequenceNumbersPopup;
