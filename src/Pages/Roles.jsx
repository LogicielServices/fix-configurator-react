import React, { useEffect, useRef, useState } from "react";
import DataGrid, { Column, Paging, Pager, Toolbar, Item, SearchPanel } from "devextreme-react/data-grid";
import { Button } from "devextreme-react/button";
import { getAllUserRoles, getAllUsersAgainstClient } from "./../Services/AccountService.js";
import { useNavigate } from "react-router-dom";
import Popup from "devextreme-react/popup";
import RoleForm from "../Components/Roles/RoleForm.jsx";
import { isBoolean } from "lodash";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const navigateTo = useNavigate();
  const gridRef = useRef();

  const getRolesData = async () => {
    gridRef?.current?.instance?.beginCustomLoading?.();
    const users = await getAllUsersAgainstClient();
    const rolesAgainstUserDTOs = users?.rolesAgainstUserDTOs || [];
    const userRoles = await getAllUserRoles();
    const roleDTOs = (userRoles?.roleDTOs || []).map?.((role) => {
      const usersCount = (rolesAgainstUserDTOs?.find?.(userRole => userRole?.roleName === role?.roleName)?.userDTOs || [])?.length;
      return { ...role, usersCount }
    });
    gridRef?.current?.instance?.endCustomLoading?.();
    setRoles(roleDTOs || []);
  }

  useEffect(() => {
    getRolesData();
  }, [])

  return (
    <div className="pt-2">
      <DataGrid
        keyExpr="roleName"
        ref={gridRef}
        dataSource={roles}
        showBorders={true}
        columnAutoWidth={true}
        rowAlternationEnabled={true}
        style={{ minHeight: 300 }}
        noDataText="No data"
      >
        <Toolbar>
          <Item>
            <Button
              id="add-row-button"
              icon="add"
              name="addRowButton"
              stylingMode="contained"
              text="Add new"
              type="default"
              location="after"
              onClick={() => setShowPopup(true)}
            />
          </Item>
          <Item name="searchPanel" location="after" />
        </Toolbar>
        <Column dataField="roleName" />
        <Column dataField="creationDateTime" caption="Created On" dataType="date" />
        <Column dataField="modificationDateTime" caption="Last Modified On" dataType="date" />
        <Column dataField="usersCount" alignment="center" />
        <Column
          caption="Actions"
          width={160}
          type="buttons"
          fixed
          fixedPosition="right"
          alignment="center"
          cellRender={({ data }) => (
            <div className="flex gap-3">
              <Button
                type="default"
                stylingMode="text"
                hint="View Users"
                icon="group"
                onClick={() => navigateTo(`./assigned-users-by-role?id=${data?.roleName}`)}
              />
              <Button
                type="default"
                stylingMode="text"
                hint="Edit Role"
                icon="edit"
                onClick={() => setShowPopup({ roleName: data?.roleName, rolePermissions: data?.rolePermissions })}
              />
            </div>
          )}
        />
        <SearchPanel visible width={200} />
        <Paging enabled defaultPageSize={13} />
        <Pager visible showPageSizeSelector={true} showInfo={true} />
      </DataGrid>
      <Popup
        visible={!!showPopup}
        onHiding={() => setShowPopup(false)}
        dragEnabled={true}
        showCloseButton={true}
        maxHeight="550px"
        height="auto"
        width="420px"
        title={`${isBoolean(showPopup) ? 'CREATE' : 'UPDATE'} ROLE`}
      >
        <RoleForm showPopup={showPopup} setShowPopup={setShowPopup} />
      </Popup>
    </div>
  );
};

export default Roles;
