/**
 * PRACTICAL INTEGRATION EXAMPLES
 * This file shows real-world examples of how to integrate the permission system
 * into your existing components.
 */

// =============================================================================
// EXAMPLE 1: MenuBar.jsx - Hide menu items without permissions
// =============================================================================

import { useCategoryAccess, usePermission } from "../hooks/usePermissions";

function MenuBar() {
  // Check if user has access to different sections
  const { hasAccess: canAccessFixSessions } = useCategoryAccess("FIXConfiguration");
  const { hasAccess: canAccessFixEngines } = useCategoryAccess("FixEngineConfiguration");
  const { hasAccess: canAccessSessions } = useCategoryAccess("FixSession");
  const { hasAccess: canManageRoles } = useCategoryAccess("Role");
  const { hasAccess: canManageAccounts } = useCategoryAccess("Account");

  return (
    <nav className="navbar">
      <div className="menu-items">
        {canAccessFixSessions && (
          <a href="/fix-configuration">FIX Configuration</a>
        )}
        {canAccessFixEngines && (
          <a href="/fix-engines">FIX Engines</a>
        )}
        {canAccessSessions && (
          <a href="/sessions">Fix Sessions</a>
        )}
        {canManageRoles && (
          <a href="/roles">Manage Roles</a>
        )}
        {canManageAccounts && (
          <a href="/accounts">Accounts</a>
        )}
      </div>
    </nav>
  );
}

export default MenuBar;


// =============================================================================
// EXAMPLE 2: SessionsGridsComponent.jsx - Show/hide grid actions
// =============================================================================

import { usePermission, useCategoryPermissions } from "../hooks/usePermissions";
import { PermissionGate } from "../Components/PermissionGate";

function SessionsGridsComponent({ sessionData }) {
  const { hasAccess: canConnectDisconnect } = usePermission("FixSession", "ConnectDisconnectFIX");
  const { hasAccess: canSetSequence } = usePermission("FixSession", "SetSequenceNumber");
  const { hasAccess: canResetSequence } = usePermission("FixSession", "ResetSequenceNumber");
  const { hasAccess: canGetConfig } = usePermission("FixSession", "GetSessionConfiguration");
  const { hasAccess: canEditConfig } = usePermission("FixSession", "EditSessionConfiguration");

  return (
    <div className="sessions-grid">
      <table>
        <tbody>
          {sessionData.map((session) => (
            <tr key={session.id}>
              <td>{session.name}</td>
              <td>
                <div className="actions">
                  {canConnectDisconnect && (
                    <button onClick={() => connectDisconnect(session.id)}>
                      Connect/Disconnect
                    </button>
                  )}
                  
                  <PermissionGate category="FixSession" action="SetSequenceNumber">
                    <button onClick={() => setSequence(session.id)}>
                      Set Sequence
                    </button>
                  </PermissionGate>

                  <PermissionGate category="FixSession" action="ResetSequenceNumber">
                    <button onClick={() => resetSequence(session.id)}>
                      Reset Sequence
                    </button>
                  </PermissionGate>

                  {canGetConfig && (
                    <button onClick={() => getConfig(session.id)}>
                      View Config
                    </button>
                  )}

                  {canEditConfig && (
                    <button onClick={() => editConfig(session.id)}>
                      Edit Config
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


// =============================================================================
// EXAMPLE 3: RoleForm.jsx - Hide permission tree items user can't access
// =============================================================================

import { useFeatureVisibilityMap } from "../hooks/usePermissions";

function RoleForm() {
  const { visibilityMap, isLoading } = useFeatureVisibilityMap();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="role-form">
      <h2>Assign Permissions</h2>
      
      {Object.entries(visibilityMap).map(([category, { actions, categoryAccessible }]) => {
        // Only show categories that are potentially accessible
        if (!categoryAccessible && Object.values(actions).every(v => !v)) {
          return null; // Hide entire category if no actions are accessible
        }

        return (
          <fieldset key={category}>
            <legend>{category}</legend>
            <div className="permission-group">
              {Object.entries(actions).map(([action, isVisible]) => (
                isVisible && (
                  <label key={action}>
                    <input type="checkbox" value={`${category}-${action}`} />
                    {action}
                  </label>
                )
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}


// =============================================================================
// EXAMPLE 4: FixMessagesPanel.jsx - Dynamic button visibility
// =============================================================================

import { useAllPermissions, useAnyPermission } from "../hooks/usePermissions";
import { AllPermissionsGate, AnyPermissionGate } from "../Components/PermissionGate";

function FixMessagesPanel() {
  // Check if user can download messages
  const { hasAccess: canDownload } = usePermission("FixMessages", "Download");

  // Check if user can do ANY message configuration
  const { hasAccess: canConfigureMessages } = useAnyPermission([
    { category: "FixTagValuesConfiguration", action: "AddFIXMessageConfiguration" },
    { category: "FixTagValuesConfiguration", action: "GetAllPreviousStreamedFIXMessages" },
  ]);

  // Check if user can access GitHub AND Jenkins (all permissions required)
  const { hasAccess: canDoFullSetup } = useAllPermissions([
    { category: "GitHub", action: "CloneGithubRepoBranch" },
    { category: "JenkinsConfiguration", action: "AddOrUpdateJenkinsConfiguration" },
  ]);

  return (
    <div className="fix-messages-panel">
      {canDownload && (
        <button className="download-btn">Download Messages</button>
      )}

      {canConfigureMessages && (
        <section className="configuration">
          <h3>Message Configuration</h3>
          
          <AnyPermissionGate
            permissions={[
              { category: "FixTagValuesConfiguration", action: "AddFIXMessageConfiguration" },
              { category: "FixTagValuesConfiguration", action: "GetAllPreviousStreamedFIXMessages" },
            ]}
          >
            <button>Configure Messages</button>
          </AnyPermissionGate>
        </section>
      )}

      <AllPermissionsGate
        permissions={[
          { category: "GitHub", action: "CloneGithubRepoBranch" },
          { category: "JenkinsConfiguration", action: "AddOrUpdateJenkinsConfiguration" },
        ]}
        fallback={<p><em>Full setup requires both GitHub and Jenkins access</em></p>}
      >
        <section className="full-setup">
          <h3>Complete Setup</h3>
          <button>Setup Full CI/CD Pipeline</button>
        </section>
      </AllPermissionsGate>
    </div>
  );
}


// =============================================================================
// EXAMPLE 5: Routes.jsx - Hide routes user doesn't have access to
// =============================================================================

import { useCategoryAccess } from "../hooks/usePermissions";
import { Routes, Route } from "react-router-dom";

function RoutesComponent() {
  const { hasAccess: canAccessRoles } = useCategoryAccess("Role");
  const { hasAccess: canAccessSessions } = useCategoryAccess("FixSession");
  const { hasAccess: canAccessGithub } = useCategoryAccess("GitHub");

  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      
      {canAccessRoles && (
        <Route path="/roles" element={<RolesPage />} />
      )}
      
      {canAccessSessions && (
        <>
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/session/:id" element={<SessionDetail />} />
        </>
      )}

      {canAccessGithub && (
        <Route path="/github-config" element={<GitHubConfig />} />
      )}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}


// =============================================================================
// EXAMPLE 6: Dashboard.jsx - Conditional widget display
// =============================================================================

import { useCategoryAccess, getCategoryPermissions } from "../hooks/usePermissions";
import PermissionService from "../Services/PermissionService";

function Dashboard() {
  const categories = PermissionService.getAccessibleCategories();
  const missingPermissions = PermissionService.getMissingPermissions();

  return (
    <div className="dashboard">
      <h1>Welcome to Dashboard</h1>

      {/* Show only accessible widgets */}
      <section className="widgets">
        {categories.includes("Account") && (
          <div className="widget account-widget">
            <h3>Account Management</h3>
            {/* Widget content */}
          </div>
        )}

        {categories.includes("FixSession") && (
          <div className="widget sessions-widget">
            <h3>Active Sessions</h3>
            {/* Widget content */}
          </div>
        )}

        {categories.includes("JenkinsConfiguration") && (
          <div className="widget jenkins-widget">
            <h3>Jenkins Configuration</h3>
            {/* Widget content */}
          </div>
        )}
      </section>

      {/* Show what permissions are missing (useful for debugging) */}
      {Object.keys(missingPermissions).length > 0 && (
        <section className="restricted-features">
          <h3>Restricted Features</h3>
          <p>Your account doesn't have access to:</p>
          <ul>
            {Object.entries(missingPermissions).map(([category, actions]) => (
              <li key={category}>
                {category}: {actions.join(", ")}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}


// =============================================================================
// EXAMPLE 7: SessionEditConfigPopup.jsx - Conditional form fields
// =============================================================================

import { usePermission } from "../hooks/usePermissions";

function SessionEditConfigPopup({ session, onSave }) {
  const { hasAccess: canEditConfig } = usePermission("FixSession", "EditSessionConfiguration");

  // If user can't edit config, show read-only view
  if (!canEditConfig) {
    return (
      <div className="popup">
        <h2>Session Configuration</h2>
        <p><strong>Note:</strong> You don't have permission to edit this configuration.</p>
        <div className="read-only-view">
          {/* Display config in read-only format */}
        </div>
      </div>
    );
  }

  return (
    <div className="popup">
      <h2>Edit Session Configuration</h2>
      <form onSubmit={handleSubmit}>
        {/* Editable form fields */}
        <button type="submit">Save Configuration</button>
      </form>
    </div>
  );
}


// =============================================================================
// EXAMPLE 8: TelnetComponent.jsx - Feature with fallback
// =============================================================================

import { PermissionGate } from "../Components/PermissionGate";

function TelnetComponent() {
  return (
    <PermissionGate
      category="Tcp"
      action="Telnet"
      fallback={
        <div className="no-access">
          <p>Telnet access is not available for your account.</p>
          <p>Contact your administrator to request access.</p>
        </div>
      }
    >
      <div className="telnet-container">
        <h2>Telnet Console</h2>
        {/* Telnet implementation */}
      </div>
    </PermissionGate>
  );
}


// =============================================================================
// EXAMPLE 9: HOC Usage in export
// =============================================================================

import { WithPermission, WithCategoryAccess } from "../utils/PermissionHOC";

// Protected button
const ProtectedRegisterButton = ({ onClick }) => (
  <button className="btn-primary" onClick={onClick}>
    Register New User
  </button>
);

export default WithPermission(
  ProtectedRegisterButton,
  "Account",
  "Register",
  <button disabled>Register (No Access)</button>
);


// =============================================================================
// EXAMPLE 10: Checking permissions in event handlers
// =============================================================================

import PermissionService from "../Services/PermissionService";

function AdvancedSessionActions() {
  const handleDeleteSession = (sessionId) => {
    // Check permission before performing action
    if (!PermissionService.hasPermission("FixSessionStatus", "DeleteFixSessionHistory")) {
      alert("You don't have permission to delete session history");
      return;
    }

    // Proceed with deletion
    deleteSessionHistory(sessionId);
  };

  const handleManageJenkins = () => {
    // Check multiple required permissions
    const required = [
      { category: "JenkinsConfiguration", action: "AddOrUpdateJenkinsConfiguration" },
      { category: "JenkinsConfiguration", action: "JenkinsTrigger" },
    ];

    if (!PermissionService.hasAllPermissions(required)) {
      alert("You need additional permissions to manage Jenkins configuration");
      return;
    }

    // Proceed with Jenkins management
    openJenkinsConfig();
  };

  return (
    <div>
      <button onClick={() => handleDeleteSession("123")}>Delete Session</button>
      <button onClick={handleManageJenkins}>Manage Jenkins</button>
    </div>
  );
}

export default {
  MenuBar,
  SessionsGridsComponent,
  RoleForm,
  FixMessagesPanel,
  RoutesComponent,
  Dashboard,
  SessionEditConfigPopup,
  TelnetComponent,
  AdvancedSessionActions,
};
