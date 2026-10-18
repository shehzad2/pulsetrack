import { useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { login, type Admin } from "../../../api";

interface LoginFormProps {
  onSuccess: (token: string, admin: Admin) => void;
  onRegisterClick: () => void;
}

export default function LoginForm({
  onSuccess,
  onRegisterClick,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const result = await login(email.trim(), password);
      onSuccess(result.token, result.admin);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="login-heading">
        <span className="eyebrow">ANALYTICS WORKSPACE</span>
        <h1>Welcome back</h1>
        <p>Sign in to understand your website traffic and activity.</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error && <div className="error-banner">{error}</div>}

        <button className="primary-button login-button" disabled={busy}>
          {busy ? "Signing in..." : "Sign in"}
          {!busy && <ArrowUpRight size={17} />}
        </button>
      </form>

      <p className="auth-switch">
        Don't have an account?{" "}
        <button
          type="button"
          className="auth-switch-button"
          onClick={onRegisterClick}
        >
          Register
        </button>
      </p>
    </>
  );
}
