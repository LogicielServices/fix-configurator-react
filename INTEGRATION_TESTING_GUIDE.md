# Permission System - Integration Testing Guide

## ✅ What Was Just Integrated

1. **MenuBar.jsx** - Menu items now hidden based on permissions
   - "Create User" button - Requires `Account/EditUser`
   - "Roles Screen" button - Requires `Role/Index`
   - Telnet icon button - Requires `Tcp/Telnet`
   - Session Monitoring icon - Requires `FixSession/GetSessionConfiguration`
   - Session Status History icon - Requires `FixSession/GetSessionConfiguration`

2. **TelnetComponent.jsx** - Permission check on dialog open
   - Shows toast error if user doesn't have `Tcp/Telnet`

3. **SecuredRoutes.jsx** - Protected routes
   - `/roles` route - Requires `Role/Index`
   - `/assign-users-by-role` route - Requires `Role/Index`

4. **PermissionDebugPanel** - New debug component
   - Shows current permissions visually

---

## 🧪 Testing Instructions

### Test 1: Verify Permission System (Quick)

**In Browser Console:**
```javascript
// Test if permission system works
import PermissionService from "./src/Services/PermissionService.js";

console.log("Your accessible categories:", PermissionService.getAccessibleCategories());
console.log("Missing permissions:", PermissionService.getMissingPermissions());

// Test specific permissions
console.log("Has Tcp/Telnet?", PermissionService.hasPermission("Tcp", "Telnet"));
console.log("Has FixSession/ConnectDisconnectFIX?", PermissionService.hasPermission("FixSession", "ConnectDisconnectFIX"));
console.log("Has Role/Index?", PermissionService.hasPermission("Role", "Index"));
```

**Expected With Your Permissions:**
- ✓ Accessible categories: `["Account", "Home", "Role", "Tcp"]`
- ✓ Tcp/Telnet: `true`
- ✗ FixSession/ConnectDisconnectFIX: `false`
- ✓ Role/Index: `true`

---

### Test 2: Verify MenuBar Updates

**Visual Check:**

With your permissions (`Account`, `Home`, `Role`, `Tcp`), you should see:

**Menu Items (3-dot menu):**
- ✓ "Create User" - VISIBLE (you have Account/EditUser)
- ✓ "Roles Screen" - VISIBLE (you have Role/Index)
- ✓ "Open GitHub" - VISIBLE (no permission required)
- ✓ "Open Grafana" - VISIBLE (no permission required)
- ✓ "Logout" - VISIBLE (always visible)

**Icon Buttons (top right):**
- ✓ Telnet icon - VISIBLE (you have Tcp/Telnet)
- ✗ Session Monitoring icon - HIDDEN (you don't have FixSession)
- ✗ Session Status History icon - HIDDEN (you don't have FixSession)

---

### Test 3: Verify Route Protection

**Visual Check:**

1. Try to navigate to `/roles` manually in URL bar
   - ✓ SHOULD WORK (you have Role/Index)
   - You see the Roles page

2. If you didn't have Role permission:
   - ✗ SHOULD FAIL (redirects to dashboard)
   - You'd see: "NotFound" or redirect

---

### Test 4: Verify Debug Panel

**Add to Your Dashboard:**

Add this to [Dashboard.jsx](../src/Pages/Dashboard.jsx):

```jsx
import { PermissionDebugPanel } from "../Components/PermissionDebugPanel";

export default function Dashboard() {
  return (
    <div>
      {process.env.NODE_ENV === 'development' && <PermissionDebugPanel />}
      {/* Rest of dashboard */}
    </div>
  );
}
```

Then:
1. Click "Show Permission Details" button
2. Verify your permissions are correctly displayed
3. Verify missing permissions shown for categories you don't have

---

### Test 5: Test with Different Permissions

**Simulate No Access:**

In browser console:
```javascript
// Simulate user with NO permissions
const token = btoa(JSON.stringify({
  role_permission: JSON.stringify([])
}));
localStorage.setItem("accessToken", `header.${token}.signature`);
location.reload();
```

**Expected Result:**
- ✗ ALL menu items hidden except Logout
- ✗ Telnet icon HIDDEN
- ✗ Session icons HIDDEN
- ✗ Roles page BLOCKED (redirects to dashboard)

**Then restore your permissions:**
```javascript
// Restore your permissions
const token = btoa(JSON.stringify({
  role_permission: JSON.stringify([
    {c: "Account", a: ["Register", "EditUser"]},
    {c: "Home", a: ["Index", "Privacy", "Error", "About", "Contact"]},
    {c: "Role", a: ["Index", "GetRoleDetails", "Create", "EditRole", "RoleUsers"]},
    {c: "Tcp", a: ["Telnet"]}
  ])
}));
localStorage.setItem("accessToken", `header.${token}.signature`);
location.reload();
```

---

## 🔍 Debugging Checklist

- [ ] Permission system service file exists: `src/Services/PermissionService.js`
- [ ] Permission hooks exist: `src/hooks/usePermissions.js`
- [ ] MenuBar imports permission hook: `usePermission`
- [ ] MenuBar filters menu items with `visible` property
- [ ] Telnet button is hidden if no `Tcp/Telnet` permission
- [ ] Session buttons are hidden if no `FixSession` permission
- [ ] Routes are protected with `useCategoryAccess` hook
- [ ] No console errors when accessing app

---

## 📊 Expected Visible Components

With your current permissions:
```
Account: ["Register", "EditUser"]
Home: ["Index", "Privacy", "Error", "About", "Contact"]
Role: ["Index", "GetRoleDetails", "Create", "EditRole", "RoleUsers"]
Tcp: ["Telnet"]
```

**Should be VISIBLE:**
- ✓ Dashboard
- ✓ Menu -> Create User
- ✓ Menu -> Roles Screen
- ✓ Telnet icon button
- ✓ Roles page (/roles)

**Should be HIDDEN:**
- ✗ Menu -> Session Monitoring
- ✗ Session Status History
- ✗ Any FIX Configuration features
- ✗ Any GitHub features
- ✗ Any Jenkins features

---

## 🐛 If Components Still Show

1. **Check console for errors:**
   - Open DevTools (F12)
   - Check Console tab for errors

2. **Verify JWT token:**
   ```javascript
   import { parseJwt } from "./src/utils/helper.js";
   console.log("JWT:", parseJwt());
   console.log("Role Permission:", parseJwt().role_permission);
   ```

3. **Check if component was actually updated:**
   - Verify MenuBar.jsx has been modified
   - Check if `usePermission` is imported
   - Verify `visible` property is used in filtering

4. **Run verification script:**
   ```javascript
   import { verifyPermissionSystem } from "./src/utils/verifyPermissions.js";
   verifyPermissionSystem();
   ```

---

## ✅ Troubleshooting

| Issue | Solution |
|-------|----------|
| Menu items still all show | Check if MenuBar.jsx was updated with permission checks |
| Telnet button always shows | Verify TelnetComponent.jsx imports PermissionService |
| Routes not protected | Verify SecuredRoutes.jsx has permission checks |
| Permission hook errors | Check if usePermissions.js exists in hooks folder |
| Console errors about imports | Clear browser cache and reload |

---

## Next Steps

After verifying components work:

1. **Add more components** - Wrap other components with permission checks
2. **Update Dashboard** - Add debug panel to verify permissions
3. **Hide more features** - Apply same pattern to other components
4. **Remove debug panel** - Before going to production

---

## Files Updated

- ✅ `src/Components/MenuBarComponent/MenuBar.jsx`
- ✅ `src/Components/TelnetComponent/index.jsx`
- ✅ `src/Components/RoutesComponent/SecuredRoutes.jsx`
- ✅ `src/Components/PermissionDebugPanel/index.jsx` (NEW)

---

## Questions?

Check:
- [DEBUGGING_GUIDE.md](../DEBUGGING_GUIDE.md) - Troubleshooting
- [PERMISSION_QUICK_REF.md](../PERMISSION_QUICK_REF.md) - Quick reference
- [INTEGRATION_EXAMPLES.md](../INTEGRATION_EXAMPLES.md) - More examples
