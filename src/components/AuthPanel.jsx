import { useState } from "react";
import {
  loginWithGoogle,
  loginWithFacebook,
  registerWithEmail,
  loginWithEmail,
  resetEmailPassword,
  isFirebaseConfigured
} from "../lib/authService";
import "./AuthPanel.css";

export default function AuthPanel({ onSuccess, onBack }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function run(action) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await action();
      if (result) onSuccess?.(result);
      else setMessage("Request completed.");
    } catch (e) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function submit(e) {
    e.preventDefault();
    if (!email.trim()) return setError("Enter your email address.");
    if (mode !== "reset" && password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (mode === "reset")
      return run(() => resetEmailPassword(email.trim()));
    if (mode === "register")
      return run(() => registerWithEmail(email.trim(), password));
    return run(() => loginWithEmail(email.trim(), password));
  }

  return (
    <section className="lumina-auth" aria-label="Lumina account">
      <button className="lumina-auth-back" type="button" onClick={onBack}>
        ← Back
      </button>

      <div className="lumina-auth-brand">
        <div className="lumina-auth-logo">L</div>
        <span>Lumina AI</span>
      </div>

      <h2>{mode === "register" ? "Create your account" : mode === "reset" ? "Reset password" : "Welcome back"}</h2>
      <p className="lumina-auth-subtitle">
        {mode === "register"
          ? "Start your journey with Lumina."
          : mode === "reset"
          ? "We'll send a password reset email."
          : "Sign in to continue with Lumina AI."}
      </p>

      {!isFirebaseConfigured() && (
        <div className="lumina-auth-notice">
          Login setup is not finished yet. Firebase configuration is required.
        </div>
      )}

      <button className="lumina-auth-social" type="button" disabled={busy || !isFirebaseConfigured()}
        onClick={() => run(loginWithGoogle)}>
        <span className="lumina-auth-google">G</span>
        Continue with Google
      </button>

      <button className="lumina-auth-social" type="button" disabled={busy || !isFirebaseConfigured()}
        onClick={() => run(loginWithFacebook)}>
        <span className="lumina-auth-facebook">f</span>
        Continue with Facebook
      </button>

      <div className="lumina-auth-divider"><span>or use email</span></div>

      <form onSubmit={submit}>
        <label htmlFor="lumina-auth-email">Email address</label>
        <input id="lumina-auth-email" type="email" autoComplete="email"
          value={email} onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com" required />

        {mode !== "reset" && (
          <>
            <label htmlFor="lumina-auth-password">Password</label>
            <input id="lumina-auth-password" type="password"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters" minLength={6} required />
          </>
        )}

        {error && <p className="lumina-auth-error" role="alert">{error}</p>}
        {message && <p className="lumina-auth-message" role="status">{message}</p>}

        <button className="lumina-auth-submit" type="submit"
          disabled={busy || !isFirebaseConfigured()}>
          {busy ? "Please wait…" : mode === "register" ? "Create account" : mode === "reset" ? "Send reset email" : "Sign in"}
        </button>
      </form>

      <div className="lumina-auth-links">
        {mode === "login" && (
          <>
            <button type="button" onClick={() => { setMode("reset"); setError(""); setMessage(""); }}>
              Forgot password?
            </button>
            <p>New to Lumina? <button type="button" onClick={() => { setMode("register"); setError(""); setMessage(""); }}>Create account</button></p>
          </>
        )}
        {mode === "register" && (
          <p>Already registered? <button type="button" onClick={() => { setMode("login"); setError(""); setMessage(""); }}>Sign in</button></p>
        )}
        {mode === "reset" && (
          <p>Remembered it? <button type="button" onClick={() => { setMode("login"); setError(""); setMessage(""); }}>Back to login</button></p>
        )}
      </div>

      <p className="lumina-auth-terms">By continuing, you agree to use Lumina AI responsibly.</p>
    </section>
  );
}
