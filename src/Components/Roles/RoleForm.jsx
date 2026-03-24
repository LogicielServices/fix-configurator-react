import React, { useEffect, useState } from "react";
import { TreeList, Selection, Column } from "devextreme-react/tree-list";
import { buildRolePermissions, buildTreeData, mapPermissionsToSelectedKeys } from "./handler";
import { isBoolean } from "lodash";
import { createRole, updateRole } from "../../Services/AccountService";
import { Form } from "devextreme-react";
import { ButtonItem, SimpleItem } from "devextreme-react/form";
import { useLoader } from "../../Provider/LoaderContext";
import { showErrorToast, showSuccessToast } from "../../utils/toastsService";
import { textMessages } from "../../utils/constants";

export default function RoleForm({ showPopup, setShowPopup }) {
  const { showLoader, hideLoader } = useLoader();
  const [formData, setFormData] = useState({ roleName: '' });
  const [selectedKeys, setSelectedKeys] = useState([]);

  const treeData = buildTreeData();

  useEffect(() => {
    if (isBoolean(showPopup)) {
      setFormData({ ...formData, roleName: "" })
      setSelectedKeys([]);
    } else {
      setFormData({ ...formData, roleName: showPopup?.roleName });
      const backendPermissions = JSON.parse(showPopup?.rolePermissions) || [];
      const mappedKeys = mapPermissionsToSelectedKeys(backendPermissions, treeData);
      setSelectedKeys(mappedKeys);
    }
  }, [showPopup])

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    try {
      showLoader();
      const rolePermissions = buildRolePermissions(selectedKeys, treeData);
      const data = {
        clientName: 'FixMonitor',
        clientRoleVMs: [{
          roleName: formData?.roleName,
          roleDescription: formData?.roleName?.toLowerCase?.(),
          isAdmin: true,
          rolePermissions,
        }]
      };
      let response;
      if (isBoolean(showPopup)) {
        response = await createRole(data);
      } else {
        response = await updateRole(data);
      }
      if (response?.isSuccess) {
        showSuccessToast(response?.message);
      } else {
        showErrorToast(response?.message || textMessages.anErrorOccurred);
      }
    } catch (error) {
      console.log(error);
      showErrorToast(textMessages.anErrorOccurred);
    } finally {
      hideLoader();
      setShowPopup(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <form onSubmit={handleSubmit}>
        <Form
          formData={formData}
          id="form"
          focusStateEnabled
          activeStateEnabled
          hoverStateEnabled
          showRequiredMark
          width="auto"
        >
          <SimpleItem dataField="roleName" editorOptions={{ disabled: !isBoolean(showPopup) }} />
          <SimpleItem dataField="rolePermissions">
            <TreeList
              dataSource={treeData}
              keyExpr="id"
              parentIdExpr="parentId"
              showBorders={false}
              height={300}
              hoverStateEnabled={true}
              selectedRowKeys={selectedKeys}
              onSelectionChanged={(e) => setSelectedKeys(e?.selectedRowKeys)}
            >
              <Selection mode="multiple" recursive={true} />
              <Column
                dataField="name"
                caption="Access List"
                width="100%"
              />
            </TreeList>
          </SimpleItem>
          <ButtonItem
            buttonOptions={{
              text: isBoolean(showPopup) ? "Create" : 'Save',
              type: "default",
              stylingMode: "contained",
              width: 120,
              useSubmitBehavior: true,
            }}
          />
        </Form>
      </form>
    </div>
  );
}