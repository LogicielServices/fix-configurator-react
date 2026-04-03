import { useEffect, useRef, useState } from "react";
import { Button as DevBtn } from "devextreme-react/button";
import DataGrid, { Button, Column, Item, Pager, Paging, SearchPanel, Toolbar } from "devextreme-react/data-grid";
import { getAllUsersAgainstClientById } from "../Services/AccountService";
import { useLocation, useNavigate } from "react-router-dom";
import CreateUser from "../Components/CreateUser";
import { usePermission } from "../hooks/usePermissions.js";
import { pathConstants } from "../utils/constants.js";

const RolesByUser = () => {
  const [roles, setRoles] = useState([]);
  const navigateTo = useNavigate();
  const createUserRef = useRef();
  const gridRef = useRef();
  const location = useLocation();
  const urlSearchParams = new URLSearchParams(location?.search);

  // Permission check
  const { hasAccess: canViewRoleUsers } = usePermission("Role", "RoleUsers");

  // Redirect if no permission
  useEffect(() => {
    if (!canViewRoleUsers) {
      navigateTo(pathConstants.unauthorized, { replace: true });
    }
  }, [canViewRoleUsers, navigateTo]);

  const getRolesData = async () => {
    gridRef?.current?.instance?.beginCustomLoading?.();
    const data = await getAllUsersAgainstClientById(urlSearchParams.get('id'));
    gridRef?.current?.instance?.endCustomLoading?.();
    setRoles(data || []);
  }

  useEffect(() => {
    getRolesData();
  }, [])

  return (
    <div className="pt-2">
      <DataGrid
        keyExpr="id"
        ref={gridRef}
        dataSource={roles}
        showBorders={true}
        columnAutoWidth={true}
        rowAlternationEnabled={true}
        style={{ minHeight: 300 }}
        noDataText="No data"
      >
        <Toolbar>
          <Item location="before">
            <DevBtn
              icon="back"
              name="addRowButton"
              stylingMode="contained"
              text="Back to list"
              type="default"
              onClick={() => navigateTo('/roles')}
            />
          </Item>
          <Item name="searchPanel" location="after" />
        </Toolbar>
        <Column dataField="email" />
        <Column dataField="userName" />
        <Column dataField="creationDateTime" caption="Created On" dataType="date" />
        <Column dataField="firstName" />
        <Column dataField="lastName" />
        <Column
          type="buttons"
          width={160}
          fixed
          fixedPosition="right"
          alignment="center"
          caption="Actions"
        >
          <Button
            type="default"
            stylingMode="text"
            hint="Edit Role"
            icon="edit"
            onClick={({ row }) => createUserRef?.current?.handleOpenCreateUserDialog?.(row?.data?.id)}
          />
        </Column>
        <SearchPanel visible width={200} />
        <Paging enabled defaultPageSize={17} />
        <Pager visible showPageSizeSelector={true} showInfo={true} />
      </DataGrid>
      <CreateUser ref={createUserRef} />
    </div>
  );
};

export default RolesByUser;
