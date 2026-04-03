import { Drawer, IconButton, Menu, MenuItem, Typography, Tooltip, Badge } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import BreadCrumbs from "../BreadCrumbsComponent/BreadCrumbs";
import { authConstants } from "../../utils/constants";
import { AccountCircle, ArrowDropDown, Dashboard, GitHub, Logout, Person, Terminal, History, Monitor, Settings } from "@mui/icons-material";
import { useContext, useRef, useState } from "react";
import { iconButtonOptions, menuOptions } from "./MenuBarHandler";
import CreateUser from "../CreateUser";
import { logout } from "../../utils/helper";
import SessionStatusGrid from "../SessionStatusGrid";
import TelnetComponent from "../TelnetComponent";
import GlobalContext from "../../Provider/GlobalProvider";
import useFixSessionStatusFeed from "../../SignalR/useFixSessionStatusFeed";
import { Popup } from 'devextreme-react';
import SessionsDataGrid from "../SessionsTabAndGrid/SessionsDataGrid";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../../hooks/usePermissions";

const MenuBar = ({ handleDrawerToggle }) => {
  const { appConfig } = useContext(GlobalContext);
  const navigateTo = useNavigate();
  const [openSessionStatuses, setOpenSessionStatuses] = useState(false);
  const [showSessionMonitorScreen, setShowSessionMonitorScreen] = useState(false);
  const { updates, clearHistory } = useFixSessionStatusFeed()
  
  // Permission checks
  const { hasAccess: canCreateUser } = usePermission("Account", "EditUser");
  const { hasAccess: canManageRoles } = usePermission("Role", "Index");
  const { hasAccess: canTelnet } = usePermission("Tcp", "Telnet");
  const { hasAccess: canViewSessions } = usePermission("FixSession", "GetSessionConfiguration");
  
  const menuItems = [
    {
      onClick: () => createUserRef?.current?.handleOpenCreateUserDialog?.(),
      icon: <Person className="me-3" fontSize="small" />,
      text: "Create User",
      visible: canCreateUser,
    },
    {
      onClick: () => navigateTo?.('/roles'),
      icon: <Settings className="me-3" fontSize="small" />,
      text: "Roles Screen",
      visible: canManageRoles,
    },
    {
      onClick: () => window.open(appConfig?.GITHUB_REPO_URL, '_blank'),
      icon: <GitHub className="me-3" fontSize="small" />,
      text: "Open GitHub",
      visible: true, // Always visible
    },
    {
      onClick: () => window.open(appConfig?.GRAFANA_URL, '_blank'),
      icon: <Dashboard className="me-3" fontSize="small" />,
      text: "Open Grafana",
      visible: true, // Always visible
    },
    {
      onClick: () => logout(),
      icon: <Logout className="me-3" fontSize="small" />,
      text: "Logout",
      visible: true, // Always visible
    },
  ];
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenu = ({ currentTarget }) => {
    if (!menuItems?.length) return;
    setAnchorEl(currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const createUserRef = useRef();
  const telnetPopUpRef = useRef();

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
        {menuItems?.filter(item => item.visible !== false)?.map((item, index) => (
          <MenuItem
            key={index}
            sx={{ color: "#4d4d4d", minWidth: "180px" }}
            onClick={() => {
              handleClose?.();
              setTimeout(() => item?.onClick?.(), 0);
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
      <TelnetComponent ref={telnetPopUpRef} />
      <Popup
        visible={showSessionMonitorScreen}
        onHiding={() => setShowSessionMonitorScreen(false)}
        fullScreen
        title="Sessions Monitoring Screen"
        showCloseButton
      >
        <div className="sess-wrap"><SessionsDataGrid /></div>
      </Popup>
      <Drawer
        animationDuration={300}
        anchor="right"
        open={openSessionStatuses}
        onClose={() => setOpenSessionStatuses(false)}
        ModalProps={{ keepMounted: true }}
      >
        <SessionStatusGrid updates={updates} clearHistory={clearHistory} />
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
      <div className="col-12 col-md-2 d-flex justify-content-end gap-2">
        {canTelnet && (
          <Tooltip title="Connection Checker (Telnet)" arrow placement="bottom">
            <IconButton
              color="primary"
              onClick={() => telnetPopUpRef?.current?.handleOpenTelnetDialog?.()}
              aria-label="telnet"
              className="nav-icon-modern"
              sx={{
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                },
                "&:active": {
                  transform: "scale(0.95)",
                },
              }}
            >
              <Terminal fontSize="20" />
            </IconButton>
          </Tooltip>
        )}
        {canViewSessions && (
          <Tooltip title="Session Monitoring Screen" arrow placement="bottom">
            <IconButton
              color="primary"
              onClick={() => setShowSessionMonitorScreen(true)}
              aria-label="session monitoring"
              className="nav-icon-modern"
              sx={{
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                },
                "&:active": {
                  transform: "scale(0.95)",
                },
              }}
            >
              <Monitor fontSize="20" />
            </IconButton>
          </Tooltip>
        )}
        {canViewSessions && (
          <Tooltip title="Session Status History" arrow placement="bottom">
            <IconButton
              color="primary"
              onClick={() => setOpenSessionStatuses(true)}
              aria-label="session statuses"
              className="nav-icon-modern"
              sx={{
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                },
                "&:active": {
                  transform: "scale(0.95)",
                },
              }}
            >
              <Badge badgeContent={updates?.length} color="error">
                <History fontSize="20" />
              </Badge>
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={localStorage.getItem(authConstants.username)} arrow placement="bottom">
          <IconButton
            {...iconButtonOptions}
            onClick={handleMenu}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              padding: "6px 8px",
              borderRadius: "8px",
              transition: "all 0.2s ease",
              "&:hover": {
                background: "rgba(33, 150, 243, 0.08)",
                transform: "scale(1.05)",
              },
              "&:active": {
                transform: "scale(0.95)",
              },
            }}
          >
            <AccountCircle fontSize="22" sx={{ color: "#2196F3" }} />
            <Typography
              fontFamily="system-ui"
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#2196F3",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: { xs: "none", sm: "inline" },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {localStorage.getItem(authConstants.username)}
            </Typography>
            {menuItems?.length ? (
              <ArrowDropDown fontSize="small" sx={{ marginBottom: "-2px", color: "#2196F3" }} />
            ) : (
              <></>
            )}
          </IconButton>
        </Tooltip>
      </div>
      {profileMenu()}
    </div>
  );
};

export default MenuBar;
