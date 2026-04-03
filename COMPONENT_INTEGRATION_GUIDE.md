/**
 * INTEGRATION HELPER - Add to your components
 * 
 * This file shows exactly which components to wrap
 */

// ============================================================================
// FILE 1: MenuBar.jsx - Hide menu items based on permissions
// ============================================================================

// ADD AT TOP:
import { useCategoryAccess } from "../hooks/usePermissions";

// REPLACE your rendering with permission checks:
export function MenuBar() {
  const { hasAccess: canAccessConfig } = useCategoryAccess("FIXConfiguration");
  const { hasAccess: canAccessEngines } = useCategoryAccess("FixEngineConfiguration");
  const { hasAccess: canAccessSessions } = useCategoryAccess("FixSession");
  const { hasAccess: canAccessGitHub } = useCategoryAccess("GitHub");
  const { hasAccess: canAccessJenkins } = useCategoryAccess("JenkinsConfiguration");
  const { hasAccess: canAccessRoles } = useCategoryAccess("Role");
  const { hasAccess: canAccessTelnet } = useCategoryAccess("Tcp");

  return (
    <nav>
      {/* Show only accessible menu items */}
      {canAccessConfig && <a href="/fix-config">FIX Configuration</a>}
      {canAccessEngines && <a href="/fix-engines">FIX Engines</a>}
      {canAccessSessions && <a href="/sessions">Fix Sessions</a>}
      {canAccessGitHub && <a href="/github">GitHub</a>}
      {canAccessJenkins && <a href="/jenkins">Jenkins</a>}
      {canAccessRoles && <a href="/roles">Roles</a>}
      {canAccessTelnet && <a href="/telnet">Telnet</a>}
    </nav>
  );
}


// ============================================================================
// FILE 2: Dashboard.jsx - Hide sections
// ============================================================================

// ADD AT TOP:
import { useAccessibleCategories } from "../hooks/usePermissions";

// REPLACE dashboard rendering:
export function Dashboard() {
  const { categories } = useAccessibleCategories();

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {/* Show only accessible sections */}
      {categories.includes("Account") && (
        <section className="account-section">
          <h2>Account Management</h2>
          {/* Account widgets */}
        </section>
      )}

      {categories.includes("FixSession") && (
        <section className="sessions-section">
          <h2>Active Sessions</h2>
          {/* Sessions widgets */}
        </section>
      )}

      {categories.includes("GitHub") && (
        <section className="github-section">
          <h2>GitHub Configuration</h2>
          {/* GitHub widgets */}
        </section>
      )}

      {categories.includes("JenkinsConfiguration") && (
        <section className="jenkins-section">
          <h2>Jenkins Configuration</h2>
          {/* Jenkins widgets */}
        </section>
      )}

      {categories.includes("Tcp") && (
        <section className="telnet-section">
          <h2>Telnet Console</h2>
          {/* Telnet console */}
        </section>
      )}
    </div>
  );
}


// ============================================================================
// FILE 3: Routes.jsx - Hide routes
// ============================================================================

// ADD AT TOP:
import { useCategoryAccess } from "../hooks/usePermissions";
import { Routes, Route } from "react-router-dom";

// WRAP route rendering:
export function AppRoutes() {
  const { hasAccess: canSessions } = useCategoryAccess("FixSession");
  const { hasAccess: canGitHub } = useCategoryAccess("GitHub");
  const { hasAccess: canJenkins } = useCategoryAccess("JenkinsConfiguration");
  const { hasAccess: canEngines } = useCategoryAccess("FixEngineConfiguration");
  const { hasAccess: canRoles } = useCategoryAccess("Role");

  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      
      {canRoles && <Route path="/roles" element={<RolesPage />} />}
      {canSessions && <Route path="/sessions" element={<SessionsPage />} />}
      {canEngines && <Route path="/engines" element={<EnginesPage />} />}
      {canGitHub && <Route path="/github" element={<GitHubPage />} />}
      {canJenkins && <Route path="/jenkins" element={<JenkinsPage />} />}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}


// ============================================================================
// FILE 4: SessionsGridsComponent.jsx - Hide grid columns/actions
// ============================================================================

// ADD AT TOP:
import { usePermission, useCategoryPermissions } from "../hooks/usePermissions";
import { PermissionGate } from "../Components/PermissionGate";

// WRAP grid actions:
export function SessionsGridsComponent({ sessions }) {
  const { hasAccess: canConnect } = usePermission("FixSession", "ConnectDisconnectFIX");
  const { hasAccess: canSetSeq } = usePermission("FixSession", "SetSequenceNumber");
  const { hasAccess: canResetSeq } = usePermission("FixSession", "ResetSequenceNumber");
  const { hasAccess: canViewConfig } = usePermission("FixSession", "GetSessionConfiguration");
  const { hasAccess: canEditConfig } = usePermission("FixSession", "EditSessionConfiguration");

  return (
    <table>
      <tbody>
        {sessions.map(session => (
          <tr key={session.id}>
            <td>{session.name}</td>
            <td>
              {/* Show only accessible actions */}
              {canConnect && <button onClick={() => connect(session.id)}>Connect</button>}
              {canSetSeq && <button onClick={() => setSeq(session.id)}>Set Sequence</button>}
              {canResetSeq && <button onClick={() => resetSeq(session.id)}>Reset</button>}
              {canViewConfig && <button onClick={() => viewConfig(session.id)}>View Config</button>}
              {canEditConfig && <button onClick={() => editConfig(session.id)}>Edit Config</button>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}


// ============================================================================
// FILE 5: FixEnginesGrid.jsx - Entire component hidden
// ============================================================================

// WRAP with HOC:
import { WithCategoryAccess } from "../utils/PermissionHOC";

function FixEnginesGridComponent() {
  return (
    <div className="engines-grid">
      {/* Your grid content */}
    </div>
  );
}

export default WithCategoryAccess(
  FixEnginesGridComponent,
  "FixEngineConfiguration"
);


// ============================================================================
// FILE 6: FixMessagesPanel.jsx - Entire component hidden
// ============================================================================

// WRAP with HOC:
import { WithCategoryAccess } from "../utils/PermissionHOC";

function FixMessagesPanelComponent() {
  return (
    <div className="messages-panel">
      {/* Your panel content */}
    </div>
  );
}

export default WithCategoryAccess(
  FixMessagesPanelComponent,
  "FixMessages"
);


// ============================================================================
// FILE 7: TelnetComponent.jsx - Conditional render
// ============================================================================

// ADD AT TOP:
import { PermissionGate } from "../Components/PermissionGate";

export function TelnetComponent() {
  return (
    <PermissionGate
      category="Tcp"
      action="Telnet"
      fallback={<p>Telnet access denied</p>}
    >
      <div className="telnet-console">
        {/* Your telnet implementation */}
      </div>
    </PermissionGate>
  );
}


// ============================================================================
// SUMMARY OF CHANGES
// ============================================================================

/*
QUICK INTEGRATION CHECKLIST:

1. MenuBar.jsx
   - Import: useCategoryAccess hook
   - Action: Add permission checks before rendering each menu item
   - Result: Menu items hidden for categories user doesn't access

2. Dashboard.jsx
   - Import: useAccessibleCategories hook
   - Action: Check if category in user's accessible categories
   - Result: Dashboard sections shown/hidden based on permissions

3. Routes.jsx
   - Import: useCategoryAccess hook
   - Action: Conditional routes based on category access
   - Result: Routes only accessible if user has permission

4. SessionsGridsComponent.jsx
   - Import: usePermission hook
   - Action: Check each action before showing button
   - Result: Action buttons shown/hidden per permission

5. FixEnginesGrid.jsx
   - Import: WithCategoryAccess HOC
   - Action: Wrap component export
   - Result: Entire component hidden if no category access

6. FixMessagesPanel.jsx
   - Import: WithCategoryAccess HOC
   - Action: Wrap component export
   - Result: Entire component hidden if no category access

7. TelnetComponent.jsx
   - Import: PermissionGate component
   - Action: Wrap JSX with gate
   - Result: Component shown/hidden based on permission

AFTER INTEGRATION:
- Test with your limited permissions
- All FixSession, GitHub, Jenkins, etc. components should be hidden
- Only Account, Home, Role, Telnet sections should be visible
*/
