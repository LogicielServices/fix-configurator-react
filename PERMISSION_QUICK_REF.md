# Permission System - Quick Reference Guide

## At a Glance

This system automatically hides features and components that a user doesn't have permission to access.

### Three Ways to Check Permissions

| Method | Best For | Example |
|--------|----------|---------|
| **Hooks** | Functional components, dynamic logic | `const {hasAccess} = usePermission(...)` |
| **Gates** | Inline conditional rendering | `<PermissionGate category="X" action="Y">...</PermissionGate>` |
| **HOCs** | Wrapping entire components | `export default WithPermission(Component, ...)` |
| **Service** | Direct checks, event handlers | `if (PermissionService.hasPermission(...))` |

---

## Quick Examples

### 1. Hide a Button (Hook)
```jsx
import { usePermission } from "../hooks/usePermissions";

function MyComponent() {
  const { hasAccess } = usePermission("Account", "Register");
  return hasAccess ? <button>Register</button> : null;
}
```

### 2. Hide a Button (Gate)
```jsx
import { PermissionGate } from "../Components/PermissionGate";

function MyComponent() {
  return (
    <PermissionGate category="Account" action="Register">
      <button>Register</button>
    </PermissionGate>
  );
}
```

### 3. Wrap a Component (HOC)
```jsx
import { WithPermission } from "../utils/PermissionHOC";

const RegisterButton = () => <button>Register</button>;
export default WithPermission(RegisterButton, "Account", "Register");
```

### 4. Check Before Action (Direct Service)
```jsx
import PermissionService from "../Services/PermissionService";

function handleAction() {
  if (!PermissionService.hasPermission("Account", "Register")) {
    alert("Not allowed");
    return;
  }
  // Do something
}
```

---

## Permission Categories & Actions

### Account
- `Register` - Allow user registration
- `EditUser` - Allow editing user details

### FIXConfiguration
- `ViewFIXSessions` - View FIX session configurations

### FixEngineConfiguration
- `ConnectToFixEngine` - Connect to FIX engine
- `DisconnectToFixEngine` - Disconnect from FIX engine

### FixEngine
- `Save` - Save FIX engine settings

### FixMessages
- `Download` - Download FIX messages

### FixSession
- `ConnectDisconnectFIX` - Connect/disconnect FIX
- `SetSequenceNumber` - Set sequence number
- `ResetSequenceNumber` - Reset sequence number
- `GetSessionConfiguration` - View session configuration
- `EditSessionConfiguration` - Edit session configuration

### FixSessionStatus
- `DeleteFixSessionHistory` - Delete session history

### FixTagValuesConfiguration
- `AddFIXMessageConfiguration` - Add message configuration
- `GetAllPreviousStreamedFIXMessages` - View streamed messages

### GitHub
- `CloneGithubRepoBranch` - Clone GitHub repository
- `AddNewSession_Acceptor` - Add new session as acceptor
- `GetSessionDetail` - Get session details

### Home
- `Index` - View home page
- `Privacy` - View privacy page
- `Error` - View error page
- `About` - View about page
- `Contact` - View contact page

### JenkinsConfiguration
- `AddOrUpdateJenkinsConfiguration` - Configure Jenkins
- `JenkinsTrigger` - Trigger Jenkins jobs
- `StartFixEngine` - Start FIX engine via Jenkins
- `StopFixEngine` - Stop FIX engine via Jenkins
- `GetJenkinsLatestJobStatus` - View Jenkins job status

### Role
- `Index` - View roles list
- `GetRoleDetails` - View role details
- `Create` - Create new role
- `EditRole` - Edit role
- `RoleUsers` - Manage role users

### Tcp
- `Telnet` - Use Telnet console

---

## Hook Reference

### Single Permission
```jsx
const { hasAccess, isLoading } = usePermission("Category", "Action");
```

### Category Access
```jsx
const { hasAccess, isLoading } = useCategoryAccess("Category");
```

### Multiple (ANY - User has at least one)
```jsx
const { hasAccess, isLoading } = useAnyPermission([
  { category: "A", action: "X" },
  { category: "B", action: "Y" }
]);
```

### Multiple (ALL - User has all)
```jsx
const { hasAccess, isLoading } = useAllPermissions([
  { category: "A", action: "X" },
  { category: "B", action: "Y" }
]);
```

### Get Category Actions
```jsx
const { permissions, isLoading } = useCategoryPermissions("Category");
// Returns: ["Action1", "Action2", ...]
```

### Get All Accessible Categories
```jsx
const { categories, isLoading } = useAccessibleCategories();
// Returns: ["Category1", "Category2", ...]
```

### Get Visibility Map
```jsx
const { visibilityMap, isLoading } = useFeatureVisibilityMap();
// Returns complex object with all features and their visibility
```

---

## Service Reference

### Basic Checks
```javascript
// Single permission
PermissionService.hasPermission("Category", "Action") → boolean

// Category access
PermissionService.hasCategoryAccess("Category") → boolean

// Full category (all actions)
PermissionService.hasFullCategoryAccess("Category") → boolean
```

### Get Data
```javascript
// User's permissions (from JWT)
PermissionService.getUserPermissions()
// Returns: [{c: "Cat", a: ["Act1", "Act2"]}, ...]

// Get actions in category
PermissionService.getCategoryPermissions("Category")
// Returns: ["Action1", "Action2", ...]

// Get all accessible categories
PermissionService.getAccessibleCategories()
// Returns: ["Category1", "Category2", ...]

// Get missing permissions (compared to complete list)
PermissionService.getMissingPermissions()
// Returns: {Category: ["Action1", "Action2"], ...}

// Get visibility map for UI rendering
PermissionService.getFeatureVisibilityMap()
// Returns: Complex nested object
```

### Multiple Permissions
```javascript
// User has ANY of these permissions
PermissionService.hasAnyPermission([
  {category: "A", action: "X"},
  {category: "B", action: "Y"}
]) → boolean

// User has ALL of these permissions
PermissionService.hasAllPermissions([
  {category: "A", action: "X"},
  {category: "B", action: "Y"}
]) → boolean
```

---

## Gate Components

All gates render `children` if permission check passes, otherwise `fallback` (default: `null`)

| Gate | Use When | Example |
|------|----------|---------|
| `PermissionGate` | Single permission | `<PermissionGate category="X" action="Y"><Comp/></PermissionGate>` |
| `CategoryGate` | Any access to category | `<CategoryGate category="X"><Comp/></CategoryGate>` |
| `AnyPermissionGate` | User has ANY permission | `<AnyPermissionGate permissions={[...]}<Comp/></AnyPermissionGate>` |
| `AllPermissionsGate` | User has ALL permissions | `<AllPermissionsGate permissions={[...]}<Comp/></AllPermissionsGate>` |

### Gate Usage
```jsx
<PermissionGate 
  category="Account" 
  action="Register" 
  fallback={<p>No Access</p>}
>
  <RegisterButton />
</PermissionGate>
```

---

## HOC Reference

| HOC | When | Syntax |
|-----|------|--------|
| `WithPermission` | Single permission | `WithPermission(Comp, "Cat", "Act", fallback?)` |
| `WithCategoryAccess` | Category access | `WithCategoryAccess(Comp, "Category", fallback?)` |
| `WithAnyPermission` | ANY permission | `WithAnyPermission(Comp, [{cat, act}, ...], fallback?)` |
| `WithAllPermissions` | ALL permissions | `WithAllPermissions(Comp, [{cat, act}, ...], fallback?)` |

### HOC Usage
```jsx
const MyButton = () => <button>Action</button>;

export default WithPermission(
  MyButton, 
  "Account", 
  "Register", 
  <button disabled>No Access</button>
);
```

---

## Common Patterns

### Pattern 1: Show/Hide Multiple Buttons
```jsx
function Actions() {
  const { hasAccess: a1 } = usePermission("Cat", "Act1");
  const { hasAccess: a2 } = usePermission("Cat", "Act2");
  
  return (
    <div>
      {a1 && <button>Action 1</button>}
      {a2 && <button>Action 2</button>}
    </div>
  );
}
```

### Pattern 2: Dynamic Menu
```jsx
function Menu() {
  const { categories } = useAccessibleCategories();
  
  return (
    <nav>
      {categories.includes("FixSession") && <a href="/sessions">Sessions</a>}
      {categories.includes("Role") && <a href="/roles">Roles</a>}
    </nav>
  );
}
```

### Pattern 3: Conditional Sections
```jsx
function Dashboard() {
  const { visibilityMap } = useFeatureVisibilityMap();
  
  return (
    <>
      {visibilityMap.Account?.categoryAccessible && (
        <AccountSection />
      )}
      {visibilityMap.FixSession?.categoryAccessible && (
        <SessionSection />
      )}
    </>
  );
}
```

### Pattern 4: Protected Routes
```jsx
function Routes() {
  const { hasAccess: canAccessRoles } = useCategoryAccess("Role");
  
  return (
    <Routes>
      {canAccessRoles && <Route path="/roles" element={<RolesPage />} />}
    </Routes>
  );
}
```

### Pattern 5: Permission-Based Form Fields
```jsx
function Form() {
  const { permissions } = useCategoryPermissions("Account");
  
  return (
    <>
      {permissions.includes("Register") && <RegisterField />}
      {permissions.includes("EditUser") && <EditFields />}
    </>
  );
}
```

---

## Error Handling

All methods are safe and return default values on error:
- Functions return `false` or `[]` on error
- Errors are logged to console
- Application won't break

---

## Testing

### Test with Different Permissions
In browser console:
```javascript
// Get current permissions
parseJwt().role_permission

// Modify permissions (for testing)
localStorage.setItem("accessToken", "eyJhbGc...");

// Clear and re-login
localStorage.clear();
```

### Test Permission Checks
```javascript
import PermissionService from "../Services/PermissionService";

// In console:
PermissionService.getAccessibleCategories()
PermissionService.getMissingPermissions()
PermissionService.hasPermission("Account", "Register")
```

---

## File Locations

| File | Purpose |
|------|---------|
| [PermissionService.js](../src/Services/PermissionService.js) | Core logic; import for direct checks |
| [usePermissions.js](../src/hooks/usePermissions.js) | React hooks; import for functional components |
| [PermissionHOC.jsx](../src/utils/PermissionHOC.jsx) | HOCs; import to wrap components |
| [PermissionGate](../src/Components/PermissionGate/index.jsx) | Gate components; import for conditional rendering |

---

## Imports Cheat Sheet

```javascript
// Service
import PermissionService from "../Services/PermissionService";

// Hooks
import {
  usePermission,
  useAnyPermission,
  useAllPermissions,
  useCategoryAccess,
  useCategoryPermissions,
  useFeatureVisibilityMap,
  useAccessibleCategories
} from "../hooks/usePermissions";

// HOCs
import {
  WithPermission,
  WithCategoryAccess,
  WithAnyPermission,
  WithAllPermissions
} from "../utils/PermissionHOC";

// Gates
import {
  PermissionGate,
  CategoryGate,
  AnyPermissionGate,
  AllPermissionsGate
} from "../Components/PermissionGate";
```

---

## Decision Tree

**"How should I check permissions?"**

```
├─ Need to check in render return?
│  ├─ Yes → Use Hook or Gate
│  │  ├─ Want inline rendering? → Gate component
│  │  └─ Want logic state? → Hook
│  └─ No → Continue below
│
├─ Wrapping entire component?
│  └─ Yes → Use HOC
│
├─ Checking in event handler?
│  └─ Yes → Use PermissionService directly
│
└─ Need complex permission logic?
   └─ Yes → Use PermissionService for data, then implement logic
```

---

## Support

For detailed examples, see [INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md)

For complete documentation, see [PERMISSION_SYSTEM.md](./PERMISSION_SYSTEM.md)
