export const originOptions = {
  vertical: "top",
  horizontal: "left",
};

export const menuOptions = {
  id: "menu-appbar",
  anchorOrigin: originOptions,
  keepMounted: true,
  transformOrigin: originOptions,
  sx: { marginTop: "45px" },
};

export const iconButtonOptions = {
  sx: { borderRadius: "8px" },
  size: "large",
  "aria-label": "account of current user",
  "aria-controls": "menu-appbar",
  "aria-haspopup": "true",
  color: "primary",
};
