# Permission-Based Access Control System

## Overview
This is a comprehensive permission-based access control system that compares user permissions from JWT tokens with the complete permissions list. Components and features not accessible by the user are automatically hidden from the portal.

## Architecture

### Files Created
1. **`/Services/PermissionService.js`** - Core permission checking logic
2. **`/hooks/usePermissions.js`** - React hooks for permission checks
3. **`/utils/PermissionHOC.jsx`** - Higher-Order Components for wrapping components
4. **`/Components/PermissionGate/index.jsx`** - Gate components for conditional rendering

## How It Works

### Data Structure
- **User Permissions** (from JWT token):
  ```json
  [
    {"c": "Account", "a": ["Register", "EditUser"]},
    {"c": "FixSession", "a": ["ConnectDisconnectFIX", "SetSequenceNumber"]},
    ...
  ]
  ```
  - `c` = category
  - `a` = array of actions (permissions)

- **Complete Permissions List** (from `rolesAccessesList`):
  ```javascript
  {
    Account: ["Register", "EditUser"],
    FixSession: ["ConnectDisconnectFIX", "SetSequenceNumber", ...],
    ...
  }
  ```

### Comparison Logic
The system checks each category and action:
1. If a category doesn't exist in user permissions → hide all features for that category
2. If an action doesn't exist in user permissions → hide that specific feature
3. Only show features/components that exist in user's role_permission

## Usage Examples

### 1. Using Permission Hooks (Recommended for Functional Components)

#### Basic Permission Check
```jsx
import { usePermission } from "../hooks/usePermissions";

function RegisterButton() {
  const { hasAccess, isLoading } = usePermission("Account", "Register");

  if (isLoading) return <div>Loading...</div>;
  if (!hasAccess) return null; // Component is hidden

  return <button>Register</button>;
}
```

#### Check Multiple Permissions (ANY)
```jsx
import { useAnyPermission } from "../hooks/usePermissions";

function EditAccountButton() {
  const { hasAccess } = useAnyPermission([
    { category: "Account", action: "Register" },
    { category: "Account", action: "EditUser" },
  ]);

  if (!hasAccess) return null;
  return <button>Edit Account</button>;
}
```

#### Check Multiple Permissions (ALL)
```jsx
import { useAllPermissions } from "../hooks/usePermissions";

function AdvancedFeature() {
  const { hasAccess } = useAllPermissions([
    { category: "Account", action: "Register" },
    { category: "FixSession", action: "ConnectDisconnectFIX" },
  ]);

  if (!hasAccess) return null;
  return <div>Advanced Feature</div>;
}
```

#### Category Access Check
```jsx
import { useCategoryAccess } from "../hooks/usePermissions";

function FixSessionPanel() {
  const { hasAccess } = useCategoryAccess("FixSession");

  if (!hasAccess) return null; // Hide entire panel
  return <div>Fix Session Features</div>;
}
```

#### Get All Category Permissions
```jsx
import { useCategoryPermissions } from "../hooks/usePermissions";

function SessionActionsMenu() {
  const { permissions } = useCategoryPermissions("FixSession");

  return (
    <ul>
      {permissions.includes("ConnectDisconnectFIX") && <li>Connect</li>}
      {permissions.includes("SetSequenceNumber") && <li>Set Sequence</li>}
      {permissions.includes("ResetSequenceNumber") && <li>Reset Sequence</li>}
    </ul>
  );
}
```

### 2. Using HOCs (Higher-Order Components)

#### Basic Permission HOC
```jsx
import { WithPermission } from "../utils/PermissionHOC";

const RegisterButton = ({ onClick }) => <button onClick={onClick}>Register</button>;

// Wrap the component
export default WithPermission(RegisterButton, "Account", "Register");
```

#### With Fallback UI
```jsx
const NoAccessMessage = () => <p>You don't have access to this feature</p>;
export default WithPermission(
  RegisterButton,
  "Account",
  "Register",
  <NoAccessMessage />
);
```

#### Category Access HOC
```jsx
import { WithCategoryAccess } from "../utils/PermissionHOC";

export default WithCategoryAccess(FixSessionPanel, "FixSession");
```

#### Multiple Permissions HOC (ANY)
```jsx
import { WithAnyPermission } from "../utils/PermissionHOC";

export default WithAnyPermission(EditPanel, [
  { category: "Account", action: "Register" },
  { category: "Account", action: "EditUser" },
]);
```

#### Multiple Permissions HOC (ALL)
```jsx
import { WithAllPermissions } from "../utils/PermissionHOC";

export default WithAllPermissions(AdvancedFeature, [
  { category: "Account", action: "Register" },
  { category: "FixSession", action: "ConnectDisconnectFIX" },
]);
```

### 3. Using Gate Components (Conditional Rendering)

#### Basic Permission Gate
```jsx
import { PermissionGate } from "../Components/PermissionGate";

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <PermissionGate category="Account" action="Register">
        <RegisterSection />
      </PermissionGate>
    </div>
  );
}
```

#### With Fallback
```jsx
<PermissionGate
  category="Account"
  action="Register"
  fallback={<div>Feature not available</div>}
>
  <RegisterSection />
</PermissionGate>
```

#### Category Gate
```jsx
import { CategoryGate } from "../Components/PermissionGate";

<CategoryGate category="FixSession" fallback={<p>No access</p>}>
  <FixSessionPanel />
</CategoryGate>
```

#### Multiple Permissions Gate (ANY)
```jsx
import { AnyPermissionGate } from "../Components/PermissionGate";

<AnyPermissionGate
  permissions={[
    { category: "Account", action: "Register" },
    { category: "Account", action: "EditUser" },
  ]}
  fallback={<p>No access</p>}
>
  <EditPanel />
</AnyPermissionGate>
```

#### Multiple Permissions Gate (ALL)
```jsx
import { AllPermissionsGate } from "../Components/PermissionGate";

<AllPermissionsGate
  permissions={[
    { category: "Account", action: "Register" },
    { category: "FixSession", action: "ConnectDisconnectFIX" },
  ]}
  fallback={<p>Requires multiple permissions</p>}
>
  <AdvancedFeature />
</AllPermissionsGate>
```

### 4. Using PermissionService Directly

```jsx
import PermissionService from "../Services/PermissionService";

// Check single permission
if (PermissionService.hasPermission("Account", "Register")) {
  // Show feature
}

// Check category access
if (PermissionService.hasCategoryAccess("FixSession")) {
  // Show entire category
}

// Get all permissions for category
const sessionActions = PermissionService.getCategoryPermissions("FixSession");

// Get accessible categories
const categories = PermissionService.getAccessibleCategories();

// Get missing permissions
const missing = PermissionService.getMissingPermissions();

// Get feature visibility map
const visibilityMap = PermissionService.getFeatureVisibilityMap();
/*
Output:
{
  Account: {
    categoryAccessible: true,
    actions: {
      Register: true,
      EditUser: true,
    }
  },
  FixSession: {
    categoryAccessible: true,
    actions: {
      ConnectDisconnectFIX: true,
      SetSequenceNumber: false,
      ...
    }
  },
  ...
}
*/
```

## Available Functions

### PermissionService Functions

#### `getUserPermissions()`
Returns user's permissions from JWT token.
```javascript
const permissions = PermissionService.getUserPermissions();
// Returns: [{c: "Account", a: ["Register", "EditUser"]}, ...]
```

#### `hasPermission(category, action)`
Check if user has specific permission.
```javascript
const canRegister = PermissionService.hasPermission("Account", "Register");
// Returns: boolean
```

#### `hasCategoryAccess(category)`
Check if user has any access to a category.
```javascript
const hasAccess = PermissionService.hasCategoryAccess("FixSession");
// Returns: boolean
```

#### `hasFullCategoryAccess(category)`
Check if user has ALL permissions in a category.
```javascript
const hasFullAccess = PermissionService.hasFullCategoryAccess("Account");
// Returns: boolean
```

#### `getCategoryPermissions(category)`
Get all actions user has in a category.
```javascript
const actions = PermissionService.getCategoryPermissions("FixSession");
// Returns: ["ConnectDisconnectFIX", "SetSequenceNumber"]
```

#### `getAccessibleCategories()`
Get all categories user has access to.
```javascript
const categories = PermissionService.getAccessibleCategories();
// Returns: ["Account", "FixSession", "GitHub", ...]
```

#### `getMissingPermissions()`
Compare user permissions with complete list. Returns missing permissions.
```javascript
const missing = PermissionService.getMissingPermissions();
// Returns: {Home: ["Privacy", "Error", "About", "Contact"], ...}
```

#### `getFeatureVisibilityMap()`
Get visibility status for all features.
```javascript
const map = PermissionService.getFeatureVisibilityMap();
// Returns: Object with visibility for each feature
```

#### `hasAnyPermission(permissions)`
Check if user has ANY of the provided permissions.
```javascript
const hasAny = PermissionService.hasAnyPermission([
  {category: "Account", action: "Register"},
  {category: "Account", action: "EditUser"}
]);
// Returns: boolean
```

#### `hasAllPermissions(permissions)`
Check if user has ALL of the provided permissions.
```javascript
const hasAll = PermissionService.hasAllPermissions([
  {category: "Account", action: "Register"},
  {category: "FixSession", action: "ConnectDisconnectFIX"}
]);
// Returns: boolean
```

## Custom Hooks

### `usePermission(category, action)`
Get permission status with loading state.
```javascript
const { hasAccess, isLoading } = usePermission("Account", "Register");
```

### `useAnyPermission(permissions)`
Check multiple permissions (ANY).
```javascript
const { hasAccess, isLoading } = useAnyPermission([...]);
```

### `useAllPermissions(permissions)`
Check multiple permissions (ALL).
```javascript
const { hasAccess, isLoading } = useAllPermissions([...]);
```

### `useCategoryAccess(category)`
Check category access.
```javascript
const { hasAccess, isLoading } = useCategoryAccess("FixSession");
```

### `useCategoryPermissions(category)`
Get all permissions in a category.
```javascript
const { permissions, isLoading } = useCategoryPermissions("FixSession");
```

### `useFeatureVisibilityMap()`
Get entire visibility map.
```javascript
const { visibilityMap, isLoading } = useFeatureVisibilityMap();
```

### `useAccessibleCategories()`
Get accessible categories.
```javascript
const { categories, isLoading } = useAccessibleCategories();
```

## Example: Complete Component Implementation

### Example 1: Navigation with Permission Checks
```jsx
import { useCategoryAccess } from "../hooks/usePermissions";
import { CategoryGate } from "../Components/PermissionGate";

function MainNavigation() {
  const { hasAccess: canAccessFix } = useCategoryAccess("FixSession");
  const { hasAccess: canAccessGithub } = useCategoryAccess("GitHub");
  const { hasAccess: canManageRoles } = useCategoryAccess("Role");

  return (
    <nav>
      <ul>
        {canAccessFix && <li><a href="/fix-sessions">FIX Sessions</a></li>}
        {canAccessGithub && <li><a href="/github">GitHub</a></li>}
        {canManageRoles && <li><a href="/roles">Manage Roles</a></li>}
      </ul>
    </nav>
  );
}
```

### Example 2: Feature Toggle Based on Permissions
```jsx
import { usePermission } from "../hooks/usePermissions";
import { PermissionGate } from "../Components/PermissionGate";

function SessionActions({ sessionId }) {
  const { hasAccess: canConnect } = usePermission("FixSession", "ConnectDisconnectFIX");
  const { hasAccess: canSetSequence } = usePermission("FixSession", "SetSequenceNumber");
  const { hasAccess: canResetSequence } = usePermission("FixSession", "ResetSequenceNumber");

  return (
    <div className="actions">
      {canConnect && <button>Connect/Disconnect</button>}
      
      <PermissionGate category="FixSession" action="SetSequenceNumber">
        <button>Set Sequence Number</button>
      </PermissionGate>

      <PermissionGate category="FixSession" action="ResetSequenceNumber">
        <button>Reset Sequence Number</button>
      </PermissionGate>
    </div>
  );
}
```

### Example 3: Menu with Nested Permissions
```jsx
import { useFeatureVisibilityMap } from "../hooks/usePermissions";

function FeatureMenu() {
  const { visibilityMap } = useFeatureVisibilityMap();

  return (
    <div>
      {Object.entries(visibilityMap).map(([category, { actions, categoryAccessible }]) => (
        categoryAccessible && (
          <div key={category}>
            <h3>{category}</h3>
            <ul>
              {Object.entries(actions).map(([action, isVisible]) => (
                isVisible && <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
        )
      ))}
    </div>
  );
}
```

## Error Handling

All functions have built-in error handling:
- Logs errors to console
- Returns safe default values (false/empty array)
- Won't break the application

## Performance Considerations

- Permission checks are cached per component (via React hooks)
- Minimize re-renders by using proper dependency arrays
- For static permission checks, use PermissionService directly
- For dynamic checks, use hooks with proper useEffect dependencies

## Testing Permissions

To test with different permissions, modify your JWT token's `role_permission` in localStorage:
```javascript
// In browser console
const token = {
  role_permission: JSON.stringify([
    {c: "Account", a: ["Register"]},
    // Add/remove permissions to test
  ])
};
localStorage.setItem("accessToken", token);
```

## Migration Guide

To add permission checks to existing components:

1. **Identify the feature** - What category and action does it use?
2. **Choose implementation method**:
   - Use hooks for functional components
   - Use gates for conditional rendering
   - Use HOCs for component wrapping
3. **Wrap or guard the component**
4. **Test with different permissions**

## Summary

This system provides:
- ✅ Automatic feature hiding based on permissions
- ✅ Multiple implementation methods (hooks, HOCs, gates)
- ✅ Easy migration to existing components
- ✅ Comprehensive permission checking logic
- ✅ Built-in error handling
- ✅ Performance optimized
- ✅ Type-safe structure (category + action)
