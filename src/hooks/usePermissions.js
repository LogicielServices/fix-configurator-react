import { useState, useEffect, useCallback } from "react";
import PermissionService, { PERMISSIONS_UPDATED_EVENT } from "../Services/PermissionService";

/**
 * Internal hook that re-evaluates when the "permissions-updated" event fires.
 * This ensures all permission hooks react to token refreshes.
 */
const usePermissionRefresh = (evaluator) => {
  const [result, setResult] = useState(() => evaluator());
  const [isLoading, setIsLoading] = useState(false);

  const reEvaluate = useCallback(() => {
    setIsLoading(true);
    try {
      setResult(evaluator());
    } catch (error) {
      console.error("Error checking permission:", error);
      setResult(evaluator.fallback ?? false);
    } finally {
      setIsLoading(false);
    }
  }, [evaluator]);

  useEffect(() => {
    reEvaluate();
  }, [reEvaluate]);

  useEffect(() => {
    window.addEventListener(PERMISSIONS_UPDATED_EVENT, reEvaluate);
    return () => window.removeEventListener(PERMISSIONS_UPDATED_EVENT, reEvaluate);
  }, [reEvaluate]);

  return { result, isLoading };
};

/**
 * Custom hook for permission-based component visibility
 * Usage: const { hasAccess, isLoading } = usePermission("Account", "Register");
 */
export const usePermission = (category, action) => {
  const evaluator = useCallback(
    () => PermissionService.hasPermission(category, action),
    [category, action]
  );
  const { result: hasAccess, isLoading } = usePermissionRefresh(evaluator);
  return { hasAccess, isLoading };
};

/**
 * Hook to check multiple permissions (ANY)
 * Returns true if user has ANY of the permissions
 */
export const useAnyPermission = (permissions) => {
  const evaluator = useCallback(
    () => PermissionService.hasAnyPermission(permissions),
    [permissions]
  );
  const { result: hasAccess, isLoading } = usePermissionRefresh(evaluator);
  return { hasAccess, isLoading };
};

/**
 * Hook to check multiple permissions (ALL)
 * Returns true if user has ALL of the permissions
 */
export const useAllPermissions = (permissions) => {
  const evaluator = useCallback(
    () => PermissionService.hasAllPermissions(permissions),
    [permissions]
  );
  const { result: hasAccess, isLoading } = usePermissionRefresh(evaluator);
  return { hasAccess, isLoading };
};

/**
 * Hook to check category access
 * Usage: const { hasAccess } = useCategoryAccess("FixSession");
 */
export const useCategoryAccess = (category) => {
  const evaluator = useCallback(
    () => PermissionService.hasCategoryAccess(category),
    [category]
  );
  const { result: hasAccess, isLoading } = usePermissionRefresh(evaluator);
  return { hasAccess, isLoading };
};

/**
 * Hook to get all category permissions
 * Usage: const { permissions, isLoading } = useCategoryPermissions("FixSession");
 */
export const useCategoryPermissions = (category) => {
  const evaluator = useCallback(
    () => PermissionService.getCategoryPermissions(category),
    [category]
  );
  const { result: permissions, isLoading } = usePermissionRefresh(evaluator);
  return { permissions, isLoading };
};

/**
 * Hook to get feature visibility map
 */
export const useFeatureVisibilityMap = () => {
  const evaluator = useCallback(
    () => PermissionService.getFeatureVisibilityMap(),
    []
  );
  const { result: visibilityMap, isLoading } = usePermissionRefresh(evaluator);
  return { visibilityMap, isLoading };
};

/**
 * Hook to get user's accessible categories
 */
export const useAccessibleCategories = () => {
  const evaluator = useCallback(
    () => PermissionService.getAccessibleCategories(),
    []
  );
  const { result: categories, isLoading } = usePermissionRefresh(evaluator);
  return { categories, isLoading };
};

export default {
  usePermission,
  useAnyPermission,
  useAllPermissions,
  useCategoryAccess,
  useCategoryPermissions,
  useFeatureVisibilityMap,
  useAccessibleCategories,
};
