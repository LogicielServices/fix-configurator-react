/**
 * Verification Script - Test Permission System
 * 
 * Run this in browser console or add to App.jsx temporarily
 */

import { rolesTests } from '../Components/Roles/handler';

export const verifyPermissionSystem = async () => {
  try {
    const PermissionService = require('./Services/PermissionService').default;
    const { parseJwt } = require('./utils/helper');

    console.log("=== PERMISSION SYSTEM VERIFICATION ===\n");

    // 1. Check JWT Token
    console.log("1. JWT Token Check:");
    const jwt = parseJwt();
    console.log("  JWT Token exists:", !!jwt);
    console.log("  Role Permission:", jwt.role_permission);

    // 2. Parse Permissions
    console.log("\n2. User Permissions Parsed:");
    const userPerms = PermissionService.getUserPermissions();
    console.log("  User Permissions:", userPerms);

    // 3. Accessible Categories
    console.log("\n3. Accessible Categories:");
    const categories = PermissionService.getAccessibleCategories();
    console.log("  Categories:", categories);

    // 4. Missing Permissions
    console.log("\n4. Missing Permissions (should be hidden):");
    const missing = PermissionService.getMissingPermissions();
    console.log("  Missing:", missing);

    // 5. Feature Visibility Map
    console.log("\n5. Feature Visibility Map:");
    const visibility = PermissionService.getFeatureVisibilityMap();
    console.log("  Full Map:", visibility);

    // 6. Test Specific Permissions
    console.log("\n6. Test Specific Permissions:");

    rolesTests.forEach(test => {
      const result = PermissionService.hasPermission(test.cat, test.action);
      const status = result === test.expected ? "✓ PASS" : "✗ FAIL";
      console.log(`  ${status}: ${test.cat}/${test.action} = ${result} (expected ${test.expected})`);
    });

    console.log("\n=== END VERIFICATION ===\n");
    console.log("If all tests PASS, the permission system is working correctly.");
    console.log("If tests FAIL, check JWT token format and rolesAccessesList.");

  } catch (error) {
    console.error("Verification Error:", error);
  }
};

// Export for use in App.jsx
export default verifyPermissionSystem;
