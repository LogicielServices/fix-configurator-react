import { useNavigate } from "react-router-dom";
import { pathConstants } from "../utils/constants";
import "./Unauthorized.css";

const Unauthorized = () => {
  const navigateTo = useNavigate();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="unauthorized-icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M12 7v6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="16.5" r="1" fill="currentColor" />
          </svg>
        </div>

        <h1 className="unauthorized-title">Access Denied</h1>

        <p className="unauthorized-message">
          You don't have the required permissions to view this page. Please
          contact your administrator to request access.
        </p>

        <div className="unauthorized-actions">
          <button
            className="unauthorized-btn unauthorized-btn-primary"
            onClick={() => navigateTo(pathConstants.dashboard)}
          >
            Go to Dashboard
          </button>
          <button
            className="unauthorized-btn unauthorized-btn-secondary"
            onClick={() => navigateTo(-1)}
          >
            Go Back
          </button>
        </div>

        <p className="unauthorized-hint">
          Error 403 &mdash; Forbidden
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;
