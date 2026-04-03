import React from "react";
import PermissionService from "../../Services/PermissionService";

/**
 * Component - PermissionGate
 * Conditionally renders children based on permission check
 * If user doesn't have permission, renders fallback (default: null)
 * 
 * Usage:
 * <PermissionGate category="Account" action="Register" fallback={<p>Access Denied</p>}>
 *   <YourComponent />
 * </PermissionGate>
 */
export const PermissionGate = ({
  category,
  action,
  children,
  fallback = null,
}) => {
  const hasAccess = PermissionService.hasPermission(category, action);

  if (!hasAccess) {
    return fallback;
  }

  return children;
};

/**
 * Component - CategoryGate
 * Conditionally renders children if user has ANY access to a category
 * 
 * Usage:
 * <CategoryGate category="FixSession" fallback={<p>No Access</p>}>
 *   <YourComponent />
 * </CategoryGate>
 */
export const CategoryGate = ({ category, children, fallback = null }) => {
  const hasAccess = PermissionService.hasCategoryAccess(category);

  if (!hasAccess) {
    return fallback;
  }

  return children;
};

/**
 * Component - AnyPermissionGate
 * Renders children if user has ANY of the provided permissions
 * 
 * Usage:
 * <AnyPermissionGate
 *   permissions={[
 *     {category: "Account", action: "Register"},
 *     {category: "Account", action: "EditUser"}
 *   ]}
 *   fallback={<p>No Access</p>}
 * >
 *   <YourComponent />
 * </AnyPermissionGate>
 */
export const AnyPermissionGate = ({
  permissions,
  children,
  fallback = null,
}) => {
  const hasAccess = PermissionService.hasAnyPermission(permissions);

  if (!hasAccess) {
    return fallback;
  }

  return children;
};

/**
 * Component - AllPermissionsGate
 * Renders children only if user has ALL of the provided permissions
 * 
 * Usage:
 * <AllPermissionsGate
 *   permissions={[
 *     {category: "Account", action: "Register"},
 *     {category: "FixSession", action: "ConnectDisconnectFIX"}
 *   ]}
 *   fallback={<p>No Access</p>}
 * >
 *   <YourComponent />
 * </AllPermissionsGate>
 */
export const AllPermissionsGate = ({
  permissions,
  children,
  fallback = null,
}) => {
  const hasAccess = PermissionService.hasAllPermissions(permissions);

  if (!hasAccess) {
    return fallback;
  }

  return children;
};

export default {
  PermissionGate,
  CategoryGate,
  AnyPermissionGate,
  AllPermissionsGate,
};
