/**
 * Permission Debug Component
 * Shows current user permissions for verification
 * Remove this component in production
 */

import { useState } from "react";
import PermissionService from "../Services/PermissionService";
import { useFeatureVisibilityMap } from "../hooks/usePermissions";

export const PermissionDebugPanel = () => {
  const [showDetails, setShowDetails] = useState(false);
  const { visibilityMap } = useFeatureVisibilityMap();

  const userPerms = PermissionService.getUserPermissions();
  const accessible = PermissionService.getAccessibleCategories();
  const missing = PermissionService.getMissingPermissions();

  return (
    <div
      style={{
        padding: "15px",
        margin: "15px",
        border: "2px solid #007bff",
        borderRadius: "5px",
        backgroundColor: "#f8f9fa",
        fontFamily: "monospace",
        fontSize: "12px",
      }}
    >
      <button
        onClick={() => setShowDetails(!showDetails)}
        style={{
          padding: "8px 12px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "3px",
          cursor: "pointer",
          marginBottom: "10px",
        }}
      >
        {showDetails ? "Hide" : "Show"} Permission Details
      </button>

      {showDetails && (
        <div style={{ marginTop: "10px" }}>
          <div style={{ marginBottom: "15px" }}>
            <strong>📋 User Permissions ({userPerms.length} categories):</strong>
            <pre
              style={{
                backgroundColor: "#fff",
                padding: "10px",
                borderRadius: "3px",
                overflowX: "auto",
              }}
            >
              {JSON.stringify(userPerms, null, 2)}
            </pre>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <strong>✓ Accessible Categories:</strong>
            <pre
              style={{
                backgroundColor: "#fff",
                padding: "10px",
                borderRadius: "3px",
              }}
            >
              {accessible.join(", ")}
            </pre>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <strong>✗ Missing Permissions ({Object.keys(missing).length} categories):</strong>
            <pre
              style={{
                backgroundColor: "#fff",
                padding: "10px",
                borderRadius: "3px",
                overflowX: "auto",
              }}
            >
              {JSON.stringify(missing, null, 2)}
            </pre>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <strong>🎯 Feature Visibility Map:</strong>
            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                backgroundColor: "#fff",
                padding: "10px",
                borderRadius: "3px",
              }}
            >
              {Object.entries(visibilityMap).map(([category, data]) => (
                <div key={category} style={{ marginBottom: "8px" }}>
                  <strong>{category}:</strong>
                  <div style={{ marginLeft: "10px", color: data.categoryAccessible ? "green" : "red" }}>
                    {data.categoryAccessible ? "✓" : "✗"} Category Access
                    <div style={{ fontSize: "11px", marginTop: "3px" }}>
                      {Object.entries(data.actions).map(([action, hasIt]) => (
                        <div key={action} style={{ color: hasIt ? "green" : "red" }}>
                          {hasIt ? "✓" : "✗"} {action}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          backgroundColor: "#fff",
          padding: "8px",
          borderRadius: "3px",
          marginTop: "10px",
        }}
      >
        <strong>Summary:</strong>
        <div>Categories: {accessible.length} accessible, {Object.keys(missing).length} restricted</div>
      </div>
    </div>
  );
};

export default PermissionDebugPanel;
