# Permission System - Debugging & Troubleshooting Guide

## Common Issues & Solutions

### Issue 1: Feature Still Shows When User Shouldn't Have Access

**Symptom:** A button or feature is visible even though user doesn't have permission

**Causes & Solutions:**

1. **Permission check not implemented**
   ```javascript
   // ❌ WRONG - No permission check
   <button>Delete Session</button>

   // ✅ CORRECT - With permission check
   <PermissionGate category="FixSessionStatus" action="DeleteFixSessionHistory">
     <button>Delete Session</button>
   </PermissionGate>
   ```

2. **Wrong category or action name**
   ```javascript
   // ❌ WRONG - Typo in category name
   const { hasAccess } = usePermission("FixSessionss", "Delete");

   // ✅ CORRECT - Verify from rolesAccessesList
   const { hasAccess } = usePermission("FixSessionStatus", "DeleteFixSessionHistory");
   ```

3. **Case sensitivity**
   ```javascript
   // ❌ WRONG - Wrong case
   usePermission("fixsession", "connectdisconnectfix")

   // ✅ CORRECT - Exact case
   usePermission("FixSession", "ConnectDisconnectFIX")
   ```

4. **Conditional logic reversed**
   ```javascript
   // ❌ WRONG - Shows when NO access
   if (!hasAccess) return <button>Delete</button>;

   // ✅ CORRECT - Shows when HAS access
   if (hasAccess) return <button>Delete</button>;
   ```

**Debug Steps:**
```javascript
// In browser console
import PermissionService from "../Services/PermissionService";

// Check specific permission
PermissionService.hasPermission("FixSessionStatus", "DeleteFixSessionHistory");

// Check all session status permissions
PermissionService.getCategoryPermissions("FixSessionStatus");

// Check if category exists
PermissionService.hasCategoryAccess("FixSessionStatus");

// Get user's raw permissions
PermissionService.getUserPermissions();
```

---

### Issue 2: Feature Hides When User Should Have Access

**Symptom:** Feature is hidden even though user has permission in JWT token

**Causes & Solutions:**

1. **JWT token not properly parsed**
   ```javascript
   // Debug: Check if JWT parsing works
   import { parseJwt } from "../utils/helper";
   const decodedToken = parseJwt();
   console.log("Full JWT data:", decodedToken);
   console.log("Role Permission:", decodedToken.role_permission);
   ```

2. **Permission format wrong in JWT**
   ```javascript
   // ✅ CORRECT format in JWT
   role_permission: [
     {c: "Account", a: ["Register", "EditUser"]},
     {c: "FixSession", a: ["ConnectDisconnectFIX"]}
   ]

   // ❌ WRONG formats (won't work)
   role_permission: "Account,FixSession"
   role_permission: {Account: ["Register"]}
   role_permission: ["Account-Register", "FixSession-ConnectDisconnectFIX"]
   ```

3. **Category/Action doesn't exist in rolesAccessesList**
   ```javascript
   // ✅ CORRECT - Use values from rolesAccessesList
   import { rolesAccessesList } from "../Components/Roles/handler";
   usePermission("Account", "Register");

   // ❌ WRONG - Made-up value
   usePermission("Account", "DeleteAccount"); // Not in rolesAccessesList
   ```

4. **Loading state not handled**
   ```javascript
   // ✅ CORRECT - Handle loading
   const { hasAccess, isLoading } = usePermission("Account", "Register");
   
   if (isLoading) return <Skeleton />; // Show placeholder while loading
   if (!hasAccess) return null;
   
   return <button>Register</button>;
   ```

**Debug Steps:**
```javascript
// Check if permission exists in complete list
import { rolesAccessesList } from "../Components/Roles/handler";

// Verify category exists
console.log("Categories available:", Object.keys(rolesAccessesList));

// Verify action exists in category
console.log("Account actions:", rolesAccessesList.Account);

// Check user's actual permissions
import PermissionService from "../Services/PermissionService";
const userPermissions = PermissionService.getUserPermissions();
console.log("User's permissions:", userPermissions);

// Step-by-step permission check
const category = "Account";
const action = "Register";
console.log("Has category access:", PermissionService.hasCategoryAccess(category));
console.log("Has specific permission:", PermissionService.hasPermission(category, action));
console.log("Category permissions:", PermissionService.getCategoryPermissions(category));
```

---

### Issue 3: Permission Hook Not Working

**Symptom:** Hook always returns false or hasAccess is always true

**Causes & Solutions:**

1. **Hook called with wrong syntax**
   ```javascript
   // ❌ WRONG - Hook called conditionally
   if (condition) {
     const { hasAccess } = usePermission(...);
   }

   // ✅ CORRECT - Hook always called at top level
   const { hasAccess } = usePermission(...);
   if (condition) {
     return <Component />;
   }
   ```

2. **Hook dependencies not updated**
   ```javascript
   // ❌ WRONG - Hook might not re-run if dependency changes
   useEffect(() => {
     const perm = usePermission(category, action);
   }, [category, action]);

   // ✅ CORRECT - Use hook directly
   const { hasAccess } = usePermission(category, action);
   ```

3. **Using in wrong component type**
   ```javascript
   // ✅ CORRECT - Class components can't use hooks
   // Use HOC instead
   export default WithPermission(MyComponent, "Cat", "Act");

   // ✅ CORRECT - Functional component
   function MyComponent() {
     const { hasAccess } = usePermission("Cat", "Act");
     return ...
   }
   ```

**Debug Tips:**
```javascript
// Add console logs to see hook execution
const { hasAccess, isLoading } = usePermission("Account", "Register");

useEffect(() => {
  console.log("Permission check result:", hasAccess);
  console.log("Is loading:", isLoading);
}, [hasAccess, isLoading]);
```

---

### Issue 4: PermissionGate Not Working

**Symptom:** Gate renders fallback or doesn't render children

**Causes & Solutions:**

1. **Fallback not specified when needed**
   ```javascript
   // ✅ Show fallback when no access
   <PermissionGate 
     category="Account" 
     action="Register"
     fallback={<p>No access to registration</p>}
   >
     <RegisterForm />
   </PermissionGate>

   // ❌ NO fallback means null shows (nothing visible)
   <PermissionGate category="Account" action="Register">
     <RegisterForm />
   </PermissionGate>
   ```

2. **Children not wrapped correctly**
   ```javascript
   // ❌ WRONG - Multiple root elements
   <PermissionGate category="Account" action="Register">
     <button>Register</button>
     <button>Skip</button>
   </PermissionGate>

   // ✅ CORRECT - Single wrapper
   <PermissionGate category="Account" action="Register">
     <div>
       <button>Register</button>
       <button>Skip</button>
     </div>
   </PermissionGate>
   ```

3. **Permission name typo**
   ```javascript
   // Debug: Print exact permission names
   <PermissionGate category="FixSession" action="ConnectDisconnectFIX">
     {/*
       Verify this exact spelling in rolesAccessesList:
       - Category: "FixSession" ✓
       - Action: "ConnectDisconnectFIX" ✓
     */}
   </PermissionGate>
   ```

**Debug Steps:**
```javascript
// Before using gate, verify permission exists
import { rolesAccessesList } from "../Components/Roles/handler";

const category = "FixSession";
const action = "ConnectDisconnectFIX";

console.log("Category exists:", category in rolesAccessesList);
console.log("Action in category:", rolesAccessesList[category]?.includes(action));

// Then use with confidence
<PermissionGate category={category} action={action}>
  <Component />
</PermissionGate>
```

---

### Issue 5: HOC Not Working

**Symptom:** Wrapped component not rendering or always rendering

**Causes & Solutions:**

1. **Wrapper not exported**
   ```javascript
   // ❌ WRONG - Exporting original component
   const MyButton = () => <button>Click</button>;
   export default MyButton;

   // ✅ CORRECT - Export wrapped component
   const MyButton = () => <button>Click</button>;
   export default WithPermission(MyButton, "Account", "Register");
   ```

2. **Fallback not visible**
   ```javascript
   // ❌ WRONG - Fallback is null (invisible)
   export default WithPermission(Component, "Cat", "Act");

   // ✅ CORRECT - Provide visible fallback
   export default WithPermission(
     Component,
     "Cat",
     "Act",
     <div className="no-access">No Access</div>
   );
   ```

3. **Components with props not working**
   ```javascript
   // ✅ CORRECT - Props are passed through
   const MyButton = ({ onClick, label }) => (
     <button onClick={onClick}>{label}</button>
   );

   export default WithPermission(MyButton, "Cat", "Act");

   // Usage - props still work
   <MyButton label="My Action" onClick={handleClick} />
   ```

**Debug Steps:**
```javascript
// Check if HOC is wrapping correctly
import { WithPermission } from "../utils/PermissionHOC";

const OriginalComponent = () => <button>Action</button>;
const WrappedComponent = WithPermission(OriginalComponent, "Cat", "Act");

// In component
<WrappedComponent /> // Should respect permissions
```

---

### Issue 6: Missing Permissions Not Detected

**Symptom:** User can see features they shouldn't have from complete list

**Causes & Solutions:**

1. **Complete list (rolesAccessesList) outdated**
   ```javascript
   // When rolesAccessesList is updated:
   const rolesAccessesList = {
     Account: ["Register", "EditUser"],
     FIXConfiguration: ["ViewFIXSessions"],
     // ... add new categories here
   };
   ```

2. **Not comparing JWT with complete list**
   ```javascript
   // ❌ WRONG - Not comparing with complete list
   const userPermissions = parseJwt().role_permission;

   // ✅ CORRECT - Use PermissionService to compare
   import PermissionService from "../Services/PermissionService";
   const missing = PermissionService.getMissingPermissions();
   console.log("Missing:", missing);
   ```

**Debug Steps:**
```javascript
// See what user is missing
import PermissionService from "../Services/PermissionService";

const missing = PermissionService.getMissingPermissions();
console.log("Features user doesn't have access to:", missing);
// Output: { Home: ["Privacy", "Error", "About", "Contact"], ... }

// See what user has
const categories = PermissionService.getAccessibleCategories();
console.log("User can access:", categories);

// See visibility map
const map = PermissionService.getFeatureVisibilityMap();
console.log("Full visibility map:", map);
```

---

## Debugging Checklist

### General Permission Issues
- [ ] JWT token exists in localStorage
- [ ] `parseJwt()` can extract `role_permission`
- [ ] `role_permission` is valid JSON array format
- [ ] Category name matches exactly (case-sensitive)
- [ ] Action name matches exactly (case-sensitive)
- [ ] Category exists in `rolesAccessesList`
- [ ] Action exists in correct category in `rolesAccessesList`

### Hook Issues
- [ ] Hook called at top level of component (not conditionally)
- [ ] Hook called in functional component (not class component)
- [ ] Dependencies are correct (or empty array if no deps)
- [ ] Both `hasAccess` and `isLoading` handled correctly

### Gate Issues
- [ ] Category and action names are correct (case-sensitive)
- [ ] Fallback prop provided if visibility needed
- [ ] Only one root element in children
- [ ] Permission exists in `rolesAccessesList`

### HOC Issues
- [ ] Wrapped component exported (not original)
- [ ] Fallback provided for when no access
- [ ] Props passed through to original component
- [ ] Correct syntax: `WithPermission(Comp, cat, action, fallback)`

### Service Issues
- [ ] Correct function called (`hasPermission` vs `hasCategoryAccess`, etc.)
- [ ] Try-catch handles errors gracefully
- [ ] Results checked before acting on them

---

## Browser Console Debug Commands

```javascript
// === Quick Diagnostics ===

// 1. Check JWT token
parseJwt()

// 2. Check role_permission in JWT
parseJwt().role_permission

// 3. Check if permission service works
import PermissionService from "../Services/PermissionService";

// 4. Get user's permissions
PermissionService.getUserPermissions()

// 5. Check specific permission
PermissionService.hasPermission("Account", "Register")

// 6. Get missing permissions
PermissionService.getMissingPermissions()

// 7. Get accessible categories
PermissionService.getAccessibleCategories()

// 8. Get visibility map
PermissionService.getFeatureVisibilityMap()

// 9. Check if category accessible
PermissionService.hasCategoryAccess("FixSession")

// 10. Get actions in category
PermissionService.getCategoryPermissions("FixSession")


// === In-Depth Debugging ===

// Verify rolesAccessesList
import { rolesAccessesList } from "../Components/Roles/handler";
console.table(rolesAccessesList)

// Check specific category
console.log("Account permissions:", rolesAccessesList.Account)

// Compare user vs complete
const user = PermissionService.getUserPermissions();
const complete = rolesAccessesList;
console.log("User permissions:", user);
console.log("Complete permissions:", complete);
console.log("Missing:", PermissionService.getMissingPermissions());


// === Permission-by-Permission Check ===

// Create a function to check all permissions
function checkAllPermissions() {
  const ps = PermissionService;
  const result = {};
  Object.keys(rolesAccessesList).forEach(cat => {
    result[cat] = {
      categoryAccess: ps.hasCategoryAccess(cat),
      actions: {}
    };
    rolesAccessesList[cat].forEach(action => {
      result[cat].actions[action] = ps.hasPermission(cat, action);
    });
  });
  return result;
}

checkAllPermissions()
```

---

## Performance Debugging

### Check for Unnecessary Renders
```javascript
// Add to component
useEffect(() => {
  console.log("Component re-rendered");
}, []);

function MyComponent() {
  console.log("Render"); // Should log once on mount
  const { hasAccess } = usePermission("Category", "Action");
  return <div>{hasAccess ? "Access" : "No Access"}</div>;
}
```

### Monitor Permission Checks
```javascript
// Wrap PermissionService to log calls
const originalHasPermission = PermissionService.hasPermission;
PermissionService.hasPermission = function(category, action) {
  console.log(`Checking: ${category}/${action}`);
  return originalHasPermission(category, action);
};
```

---

## Testing Permission States

### Simulate Different Permission Levels

```javascript
// In browser console:

// 1. Admin (full access)
const adminToken = btoa(JSON.stringify({
  role_permission: JSON.stringify([
    {c: "Account", a: ["Register", "EditUser"]},
    {c: "FixSession", a: ["ConnectDisconnectFIX", "SetSequenceNumber", "ResetSequenceNumber", "GetSessionConfiguration", "EditSessionConfiguration"]},
    {c: "Role", a: ["Index", "GetRoleDetails", "Create", "EditRole", "RoleUsers"]},
    // ... all permissions
  ])
}));
localStorage.setItem("accessToken", `header.${adminToken}.signature`);
location.reload();

// 2. Limited access (read-only)
const readOnlyToken = btoa(JSON.stringify({
  role_permission: JSON.stringify([
    {c: "FixSession", a: ["GetSessionConfiguration"]},
    {c: "Role", a: ["Index"]},
  ])
}));
localStorage.setItem("accessToken", `header.${readOnlyToken}.signature`);
location.reload();

// 3. No access
const noAccessToken = btoa(JSON.stringify({
  role_permission: JSON.stringify([])
}));
localStorage.setItem("accessToken", `header.${noAccessToken}.signature`);
location.reload();
```

---

## Common Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot read property 'split' of null` | JWT token missing or invalid | Check localStorage, re-login |
| `JSON.parse is not a function` | role_permission is not valid JSON | Verify JWT format |
| `Cannot read property 'includes' of undefined` | Category doesn't exist in user permissions | Check category spelling |
| `undefined is not an object` | rolesAccessesList not imported | Import from handler.js |
| Feature still shows despite no permission | No permission check added | Wrap component with permission check |
| All features hidden even with permissions | Wrong category/action name | Verify exact spelling from rolesAccessesList |

---

## Enable Debug Logging

Create a file: `/src/utils/permissionDebug.js`

```javascript
export const enablePermissionDebugging = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const PermissionService = require('../Services/PermissionService').default;

  // Log all permission checks
  const checkFunctions = [
    'hasPermission',
    'hasCategoryAccess',
    'hasFullCategoryAccess',
    'getCategoryPermissions',
    'getMissingPermissions',
    'getFeatureVisibilityMap'
  ];

  checkFunctions.forEach(fn => {
    const original = PermissionService[fn];
    PermissionService[fn] = function(...args) {
      console.log(`[PermissionService.${fn}]`, args);
      const result = original.apply(this, args);
      console.log(`→ Result:`, result);
      return result;
    };
  });

  console.log('Permission debugging enabled');
  return PermissionService;
};
```

Use in App.jsx:
```javascript
import { enablePermissionDebugging } from './utils/permissionDebug';

if (process.env.NODE_ENV === 'development') {
  enablePermissionDebugging();
}
```

---

## Getting Help

1. **Check the documentation:**
   - [PERMISSION_QUICK_REF.md](./PERMISSION_QUICK_REF.md) - Quick reference
   - [PERMISSION_SYSTEM.md](./PERMISSION_SYSTEM.md) - Complete docs
   - [INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md) - Examples

2. **Use the browser console:**
   - Run debug commands from "Browser Console Debug Commands" section

3. **Check  this troubleshooting guide:**
   - Follow relevant issue scenario

4. **Verify your implementation:**
   - Follow the debugging checklist

---

## Still Having Issues?

**Step 1:** Run all debug commands
```javascript
import PermissionService from "../Services/PermissionService";
console.log(PermissionService.getFeatureVisibilityMap());
```

**Step 2:** Check the raw JWT
```javascript
import { parseJwt } from "../utils/helper";
console.log(parseJwt());
```

**Step 3:** Verify rolesAccessesList
```javascript
import { rolesAccessesList } from "../Components/Roles/handler";
console.table(rolesAccessesList);
```

**Step 4:** Check comparison
```javascript
const missing = PermissionService.getMissingPermissions();
console.log("Missing permissions:", missing);
```

**Step 5:** Review implementation
- Check if category/action names match exactly
- Verify syntax (hook, gate, HOC, service)
- Ensure permission check is in correct location
