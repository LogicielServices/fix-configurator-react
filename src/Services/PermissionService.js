import { getAccessToken, parseJwt } from "../utils/helper";
import { rolesAccessesList } from "../Components/Roles/handler";

/**
 * Permission Service - Manages role-based access control
 * Caches parsed permissions to avoid redundant JWT parsing per render cycle.
 */

// Module-level cache
let _cachedToken = null;
let _cachedPermissions = [];

const PERMISSIONS_UPDATED_EVENT = "permissions-updated";

/**
 * Invalidate the permission cache.
 * Call this after token refresh so hooks and components pick up new permissions.
 */
export const invalidateCache = () => {
  _cachedToken = null;
  _cachedPermissions = [];
  window.dispatchEvent(new Event(PERMISSIONS_UPDATED_EVENT));
};

/**
 * Get user's permissions from JWT token (cached).
 * @returns {Array} Array of permission objects with structure {c: "category", a: ["action1", "action2"]}
 */
export const getUserPermissions = () => {
  try {
    const currentToken = getAccessToken();
    if (!currentToken) return [];

    // Return cached result if token hasn't changed
    if (currentToken === _cachedToken) return _cachedPermissions;

    const tokenData = parseJwt();
    const rolePermission = tokenData?.role_permission;

    if (!rolePermission) {
      _cachedToken = currentToken;
      _cachedPermissions = [];
      return [];
    }

    let permissions = [];
    if (typeof rolePermission === "string") {
      permissions = JSON.parse(rolePermission);
    } else if (Array.isArray(rolePermission)) {
      permissions = rolePermission;
    }

    _cachedToken = currentToken;
    _cachedPermissions = permissions;
    return permissions;
  } catch (error) {
    console.error("Error parsing user permissions:", error);
    return [];
  }
};

/**
 * Check if user has a specific action in a category
 */
export const hasPermission = (category, action) => {
  if (!category || !action) return false;

  const userPermissions = getUserPermissions();
  const categoryPermission = userPermissions.find((p) => p.c === category);
  if (!categoryPermission) return false;

  return categoryPermission.a.includes(action);
};

/**
 * Check if user has all actions in a category
 */
export const hasFullCategoryAccess = (category) => {
  if (!category) return false;

  const userPermissions = getUserPermissions();
  const allActionsInCategory = rolesAccessesList[category] || [];
  const categoryPermission = userPermissions.find((p) => p.c === category);
  if (!categoryPermission) return false;

  return allActionsInCategory.every((action) =>
    categoryPermission.a.includes(action)
  );
};

/**
 * Check if user has any action in a category
 */
export const hasCategoryAccess = (category) => {
  if (!category) return false;

  const userPermissions = getUserPermissions();
  return userPermissions.some((p) => p.c === category && p.a.length > 0);
};

/**
 * Get user's accessible actions in a category
 */
export const getCategoryPermissions = (category) => {
  if (!category) return [];

  const userPermissions = getUserPermissions();
  const categoryPermission = userPermissions.find((p) => p.c === category);
  return categoryPermission?.a || [];
};

/**
 * Get all user accessible categories
 */
export const getAccessibleCategories = () => {
  const userPermissions = getUserPermissions();
  return userPermissions.map((p) => p.c);
};

/**
 * Compare user permissions with complete permissions list.
 * Returns missing permissions.
 */
export const getMissingPermissions = () => {
  const userPermissions = getUserPermissions();
  const missing = {};

  Object.entries(rolesAccessesList).forEach(([category, allActions]) => {
    const userActions = userPermissions.find((p) => p.c === category)?.a || [];
    const missingActions = allActions.filter((action) => !userActions.includes(action));

    if (missingActions.length > 0) {
      missing[category] = missingActions;
    }
  });

  return missing;
};

/**
 * Get visibility map for all features
 */
export const getFeatureVisibilityMap = () => {
  const userPermissions = getUserPermissions();
  const visibilityMap = {};

  Object.entries(rolesAccessesList).forEach(([category, actions]) => {
    visibilityMap[category] = {
      categoryAccessible: false,
      actions: {},
    };

    actions.forEach((action) => {
      const hasAccess = userPermissions.some(
        (p) => p.c === category && p.a.includes(action)
      );
      visibilityMap[category].actions[action] = hasAccess;
      if (hasAccess) {
        visibilityMap[category].categoryAccessible = true;
      }
    });
  });

  return visibilityMap;
};

/**
 * Check multiple permissions (ANY) - returns true if user has ANY of the permissions
 */
export const hasAnyPermission = (permissions) => {
  if (!Array.isArray(permissions) || permissions.length === 0) return false;

  return permissions.some(({ category, action }) =>
    hasPermission(category, action)
  );
};

/**
 * Check multiple permissions (ALL) - returns true if user has ALL of the permissions
 */
export const hasAllPermissions = (permissions) => {
  if (!Array.isArray(permissions) || permissions.length === 0) return false;

  return permissions.every(({ category, action }) =>
    hasPermission(category, action)
  );
};

export { PERMISSIONS_UPDATED_EVENT };

export default {
  getUserPermissions,
  hasPermission,
  hasFullCategoryAccess,
  hasCategoryAccess,
  getCategoryPermissions,
  getAccessibleCategories,
  getMissingPermissions,
  getFeatureVisibilityMap,
  hasAnyPermission,
  hasAllPermissions,
  invalidateCache,
};
