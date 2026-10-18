import { useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { register, type Admin } from "../../../api";

interface RegisterFormProps {
  onSuccess: (token: string, admin: Admin) => void;
  onLoginClick: () => void;
}

export default function RegisterForm({
  onSuccess,
  onLoginClick,
}: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      const result = await register(
        name.trim(),
        email.trim(),
        password,
        confirmation,
      );

      onSuccess(result.token, result.admin);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="login-heading">
        <span className="eyebrow">GET STARTED</span>
        <h1>Create your account</h1>
        <p>Register to start tracking your website analytics.</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="register-name">Full name</label>
        <input
          id="register-name"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
          maxLength={100}
          required
        />

        <label htmlFor="register-email">Email address</label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />

        <label htmlFor="register-confirmation">Confirm password</label>
        <input
          id="register-confirmation"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          minLength={8}
          required
        />

        {error && <div className="error-banner">{error}</div>}

        <button className="primary-button login-button" disabled={busy}>
          {busy ? "Creating account..." : "Create account"}
          {!busy && <ArrowUpRight size={17} />}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account?{" "}
        <button
          type="button"
          className="auth-switch-button"
          onClick={onLoginClick}
        >
          Log in
        </button>
      </p>
    </>
  );
}
