import { useState, useEffect } from "react";
import PermissionService from "../Services/PermissionService";

/**
 * Custom hook for permission-based component visibility
 * Usage: const { hasAccess, isLoading } = usePermission("Account", "Register");
 */
export const usePermission = (category, action) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const access = PermissionService.hasPermission(category, action);
      setHasAccess(access);
    } catch (error) {
      console.error("Error checking permission:", error);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  }, [category, action]);

  return { hasAccess, isLoading };
};

/**
 * Hook to check multiple permissions (ANY)
 * Returns true if user has ANY of the permissions
 * Usage: const { hasAccess } = useAnyPermission([
 *   {category: "Account", action: "Register"},
 *   {category: "Account", action: "EditUser"}
 * ]);
 */
export const useAnyPermission = (permissions) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const access = PermissionService.hasAnyPermission(permissions);
      setHasAccess(access);
    } catch (error) {
      console.error("Error checking permissions:", error);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  }, [permissions]);

  return { hasAccess, isLoading };
};

/**
 * Hook to check multiple permissions (ALL)
 * Returns true if user has ALL of the permissions
 * Usage: const { hasAccess } = useAllPermissions([
 *   {category: "Account", action: "Register"},
 *   {category: "FixSession", action: "ConnectDisconnectFIX"}
 * ]);
 */
export const useAllPermissions = (permissions) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const access = PermissionService.hasAllPermissions(permissions);
      setHasAccess(access);
    } catch (error) {
      console.error("Error checking permissions:", error);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  }, [permissions]);

  return { hasAccess, isLoading };
};

/**
 * Hook to check category access
 * Usage: const { hasAccess } = useCategoryAccess("FixSession");
 */
export const useCategoryAccess = (category) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const access = PermissionService.hasCategoryAccess(category);
      setHasAccess(access);
    } catch (error) {
      console.error("Error checking category access:", error);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  return { hasAccess, isLoading };
};

/**
 * Hook to get all category permissions
 * Usage: const { permissions, isLoading } = useCategoryPermissions("FixSession");
 */
export const useCategoryPermissions = (category) => {
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const perms = PermissionService.getCategoryPermissions(category);
      setPermissions(perms);
    } catch (error) {
      console.error("Error fetching category permissions:", error);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  return { permissions, isLoading };
};

/**
 * Hook to get feature visibility map
 * Usage: const { visibilityMap, isLoading } = useFeatureVisibilityMap();
 */
export const useFeatureVisibilityMap = () => {
  const [visibilityMap, setVisibilityMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const map = PermissionService.getFeatureVisibilityMap();
      setVisibilityMap(map);
    } catch (error) {
      console.error("Error fetching visibility map:", error);
      setVisibilityMap({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { visibilityMap, isLoading };
};

/**
 * Hook to get user's accessible categories
 * Usage: const { categories, isLoading } = useAccessibleCategories();
 */
export const useAccessibleCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const cats = PermissionService.getAccessibleCategories();
      setCategories(cats);
    } catch (error) {
      console.error("Error fetching accessible categories:", error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
