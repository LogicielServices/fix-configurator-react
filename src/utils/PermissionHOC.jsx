import React from "react";
import PermissionService from "../Services/PermissionService";

/**
 * Higher Order Component (HOC) - WithPermission
 * Wraps a component and hides it if user doesn't have required permission
 * 
 * Usage:
 * const ProtectedComponent = WithPermission(MyComponent, "Account", "Register");
 * <ProtectedComponent />
 */
export const WithPermission = (
  Component,
  category,
  action,
  fallback = null
) => {
  const WrappedComponent = (props) => {
    const hasAccess = PermissionService.hasPermission(category, action);

    if (!hasAccess) {
      return fallback;
    }

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `WithPermission(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

/**
 * HOC - WithCategoryAccess
 * Wraps a component and hides it if user doesn't have any access to category
 * 
 * Usage:
 * const ProtectedComponent = WithCategoryAccess(MyComponent, "FixSession");
 * <ProtectedComponent />
 */
export const WithCategoryAccess = (Component, category, fallback = null) => {
  const WrappedComponent = (props) => {
    const hasAccess = PermissionService.hasCategoryAccess(category);

    if (!hasAccess) {
      return fallback;
    }

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `WithCategoryAccess(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

/**
 * HOC - WithAnyPermission
 * Wraps a component and hides it if user doesn't have ANY of the permissions
 * 
 * Usage:
 * const ProtectedComponent = WithAnyPermission(MyComponent, [
 *   {category: "Account", action: "Register"},
 *   {category: "Account", action: "EditUser"}
 * ]);
 */
export const WithAnyPermission = (Component, permissions, fallback = null) => {
  const WrappedComponent = (props) => {
    const hasAccess = PermissionService.hasAnyPermission(permissions);

    if (!hasAccess) {
      return fallback;
    }

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `WithAnyPermission(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

/**
 * HOC - WithAllPermissions
 * Wraps a component and hides it if user doesn't have ALL of the permissions
 * 
 * Usage:
 * const ProtectedComponent = WithAllPermissions(MyComponent, [
 *   {category: "Account", action: "Register"},
 *   {category: "FixSession", action: "ConnectDisconnectFIX"}
 * ]);
 */
export const WithAllPermissions = (Component, permissions, fallback = null) => {
  const WrappedComponent = (props) => {
    const hasAccess = PermissionService.hasAllPermissions(permissions);

    if (!hasAccess) {
      return fallback;
    }

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `WithAllPermissions(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

export default {
  WithPermission,
  WithCategoryAccess,
  WithAnyPermission,
  WithAllPermissions,
};
