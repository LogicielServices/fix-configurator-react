
import React, { useContext, useId, useState } from "react";
import { login } from "../Services/AuthService";
import GlobalContext from "../Provider/GlobalProvider";
import { authConstants, pathConstants } from "../utils/constants";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";

const loginDefaults = {
  brand: { name: "Fix Configurator" },
  forgotPasswordUrl: "#",
};

export default function Login() {
  const { appConfig, handleLoginSuccess } = useContext(GlobalContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigateTo = useNavigate();

  const usernameId = useId();
  const passwordId = useId();
  const rememberId = useId();

  const validate = () => {
    const next = {};
    if (!username.trim()) next.username = "Username is required.";
    else if (username.trim().length < 3)
      next.username = "Username must be at least 3 characters.";

    if (!password) next.password = "Password is required.";
    else if (password.length < 6)
      next.password = "Password must be at least 6 characters.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);
    const response = await login(appConfig?.API_URL, username, password, remember);
    if (response?.isSuccess) {
      localStorage.setItem(authConstants.username, username);
      localStorage.setItem(authConstants.apiUrl, appConfig?.API_URL);
      localStorage.setItem(
        authConstants.accessToken,
        response?.data?.accessToken || ""
      );
      localStorage.setItem(
        authConstants.refreshToken,
        response?.data?.refreshToken || ""
      );
      localStorage.setItem(
        authConstants.accessTokenExpiration,
        response?.data?.accessTokenExpiration || ""
      );
      localStorage.setItem(
        authConstants.refreshTokenExpiration,
        response?.data?.refreshTokenExpiration || ""
      );
      handleLoginSuccess();
      navigateTo(pathConstants.dashboard);
    } else {
      setServerError(
        response?.message || "Unable to log in. Please verify your credentials."
      );
    }
    setLoading(false);
  };

  return (
    <main className="auth-shell">
      <section className="auth-panel" role="dialog" aria-labelledby="authTitle">
        <header className="auth-header">
          <div className="auth-brand">
            {loginDefaults?.brand?.logoUrl ? (
              <img
                alt={`${loginDefaults?.brand.name} logo`}
                className="auth-logo"
                width="56"
                height="56"
                loading="eager"
              />
            ) : (
              <div className="auth-logo--placeholder" aria-hidden="true">
                {(loginDefaults?.brand?.name || "P").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <h1 id="authTitle" className="auth-title">
                {loginDefaults?.brand?.name?.toUpperCase()}
              </h1>
              <p className="auth-subtitle">Sign in to your account</p>
            </div>
          </div>
        </header>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {serverError && (
            <div className="alert alert-error" role="alert">
              <span>{serverError}</span>
            </div>
          )}

          {/* Username / Email Field */}
          <div className="field">
            <label htmlFor={usernameId}>Username</label>
            <div className="field-wrapper">
              <span className={`field-icon ${username ? "active" : ""}`}>
                <Email fontSize="small" />
              </span>
              <input
                id={usernameId}
                type="text"
                name="username"
                inputMode="text"
                autoComplete="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-invalid={Boolean(errors.username)}
                aria-describedby={errors.username ? `${usernameId}-error` : undefined}
                disabled={loading}
              />
            </div>
            {errors.username && (
              <div className="field-error" id={`${usernameId}-error`}>
                {errors.username}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="field">
            <label htmlFor={passwordId}>Password</label>
            <div className="field-wrapper password-row">
              <span className={`field-icon ${password ? "active" : ""}`}>
                <Lock fontSize="small" />
              </span>
              <input
                id={passwordId}
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? `${passwordId}-error` : undefined}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((s) => !s)}
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPassword ? (
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </button>
            </div>
            {errors.password && (
              <div className="field-error" id={`${passwordId}-error`}>
                {errors.password}
              </div>
            )}
          </div>

          {/* Form Meta - Remember Me & Forgot Password */}
          <div className="form-meta">
            <label className="checkbox">
              <input
                id={rememberId}
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading}
              />
              <span>Remember me</span>
            </label>

            <a className="link" href={loginDefaults?.forgotPasswordUrl}>
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <footer className="auth-footer" aria-hidden="true">
          <small>
            © {new Date().getFullYear()} {loginDefaults?.brand?.name || "Portal"}. All rights reserved.
          </small>
        </footer>
      </section>
    </main>
  );
}
