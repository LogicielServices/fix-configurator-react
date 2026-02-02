import { Drawer, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import BreadCrumbs from "../BreadCrumbsComponent/BreadCrumbs";
import { authConstants } from "../../utils/constants";
import { AccountCircle, ArrowDropDown, Logout, Notifications, Person } from "@mui/icons-material";
import { useRef, useState } from "react";
import { iconButtonOptions, menuOptions } from "./MenuBarHandler";
import CreateUser from "../CreateUser";
import { logout } from "../../utils/helper";
import SessionStatusGrid from "../SessionStatusGrid";

const MenuBar = ({ handleDrawerToggle }) => {
  const [openSessionStatuses, setOpenSessionStatuses] = useState(false);
  const menuItems = [
    {
      onClick: () => createUserRef?.current?.handleOpenCreateUserDialog?.(),
      icon: <Person className="me-3" fontSize="small" />,
      text: "Create User",
    },
    {
      onClick: () => logout(),
      icon: <Logout className="me-3" fontSize="small" />,
      text: "Logout",
    },
  ];
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenu = ({ currentTarget }) => {
    if (!menuItems?.length) return;
    setAnchorEl(currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const createUserRef = useRef();

  const profileMenu = () => {
    return (
      <Menu
        {...menuOptions}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={({ target }) => {
          if (target?.classList?.contains?.("MuiModal-backdrop")) handleClose();
        }}
      >
        {menuItems?.map((item, index) => (
          <MenuItem
            key={index}
            sx={{ color: "#4d4d4d", minWidth: "180px" }}
            onClick={() => {
              item?.onClick?.();
              handleClose?.();
            }}
            disabled={!!item?.disabled}
          >
            {item?.icon}
            <span>{item?.text}</span>
          </MenuItem>
        ))}
      </Menu>
    );
  };

  return (
    <div className="row w-100 mb-2">
      <CreateUser ref={createUserRef} />
      <Drawer
        animationDuration={300}
        anchor="right"
        open={openSessionStatuses}
        onClose={() => setOpenSessionStatuses(false)}
      >
        <SessionStatusGrid />
      </Drawer>
      <div className="col-12 col-md-10 d-flex gap-1">
        <IconButton
          color="default"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>
        <BreadCrumbs />
      </div>
      <div className="col-12 col-md-2 d-flex justify-content-end">
        <IconButton
          color="primary"
          onClick={() => setOpenSessionStatuses(true)}
          aria-label="session statuses"
        >
          <Notifications />
        </IconButton>
        <IconButton {...iconButtonOptions} onClick={handleMenu}>
          <AccountCircle fontSize="12" />
          <Typography fontFamily="system-ui" marginLeft={1}>
            {localStorage.getItem(authConstants.username)}
          </Typography>
          {menuItems?.length ? (
            <ArrowDropDown fontSize="small" sx={{ marginBottom: "-2px" }} />
          ) : (
            <></>
          )}
        </IconButton>
      </div>
      {profileMenu()}
    </div>
  );
};

export default MenuBar;
