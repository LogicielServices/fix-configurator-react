import { parseJwt } from "../utils/helper";
import { rolesAccessesList } from "../Components/Roles/handler";

/**
 * Permission Service - Manages role-based access control
 * Compares user permissions from JWT token with the complete permissions list
 */

/**
 * Get user's permissions from JWT token
 * @returns {Array} Array of permission objects with structure {c: "category", a: ["action1", "action2"]}
 */
export const getUserPermissions = () => {
  try {
    const tokenData = parseJwt();
    const rolePermission = tokenData?.role_permission;
    
    if (!rolePermission) {
      console.warn("No role_permission found in JWT token");
      return [];
    }

    // If it's a string, parse it
    if (typeof rolePermission === "string") {
      return JSON.parse(rolePermission);
    }

    // If it's already an array, return it
    if (Array.isArray(rolePermission)) {
      return rolePermission;
    }

    return [];
  } catch (error) {
    console.error("Error parsing user permissions:", error);
    return [];
  }
};

/**
 * Check if user has a specific action in a category
 * @param {string} category - The permission category (e.g., "Account", "FixSession")
 * @param {string} action - The specific action (e.g., "Register", "EditUser")
 * @returns {boolean} True if user has permission
 */
export const hasPermission = (category, action) => {
  if (!category || !action) {
    console.warn("Category and action are required for permission check");
    return false;
  }

  const userPermissions = getUserPermissions();
  const categoryPermission = userPermissions.find((p) => p.c === category);

  if (!categoryPermission) {
    return false;
  }

  return categoryPermission.a.includes(action);
};

/**
 * Check if user has all actions in a category
 * @param {string} category - The permission category
 * @returns {boolean} True if user has all actions in category
 */
export const hasFullCategoryAccess = (category) => {
  if (!category) return false;

  const userPermissions = getUserPermissions();
  const allActionsInCategory = rolesAccessesList[category] || [];
  const categoryPermission = userPermissions.find((p) => p.c === category);

  if (!categoryPermission) {
    return false;
  }

  return allActionsInCategory.every((action) =>
    categoryPermission.a.includes(action)
  );
};

/**
 * Check if user has any action in a category
 * @param {string} category - The permission category
 * @returns {boolean} True if user has at least one action in category
 */
export const hasCategoryAccess = (category) => {
  if (!category) return false;

  const userPermissions = getUserPermissions();
  return userPermissions.some((p) => p.c === category && p.a.length > 0);
};

/**
 * Get user's accessible actions in a category
 * @param {string} category - The permission category
 * @returns {Array} Array of accessible actions
 */
export const getCategoryPermissions = (category) => {
  if (!category) return [];

  const userPermissions = getUserPermissions();
  const categoryPermission = userPermissions.find((p) => p.c === category);

  return categoryPermission?.a || [];
};

/**
 * Get all user accessible categories
 * @returns {Array} Array of categories user has access to
 */
export const getAccessibleCategories = () => {
  const userPermissions = getUserPermissions();
  return userPermissions.map((p) => p.c);
};

/**
 * Compare user permissions with complete permissions list
 * Returns missing permissions
 * @returns {Object} Object with categories and their missing permissions
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
 * Returns which features should be visible based on user permissions
 * @returns {Object} Object with feature visibility status
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
 * @param {Array} permissions - Array of {category, action} objects
 * @returns {boolean}
 */
export const hasAnyPermission = (permissions) => {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }

  return permissions.some(({ category, action }) =>
    hasPermission(category, action)
  );
};

/**
 * Check multiple permissions (ALL) - returns true if user has ALL of the permissions
 * @param {Array} permissions - Array of {category, action} objects
 * @returns {boolean}
 */
export const hasAllPermissions = (permissions) => {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }

  return permissions.every(({ category, action }) =>
    hasPermission(category, action)
  );
};

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
};
