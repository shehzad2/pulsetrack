import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { requestOtp, saveAuthSession, verifyOtp } from "../auth";

export default function AuthPage() {
 const location = useLocation();
const navigate = useNavigate();
const isRegister = location.pathname === "/register";

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [developmentOtp, setDevelopmentOtp] = useState("");

  async function handleRequestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    try {
      const result = await requestOtp({
        mobile_number: mobile,
        purpose: isRegister ? "register" : "login",
        ...(isRegister ? { name: name.trim() } : {}),
      });

      setDevelopmentOtp(result.development_otp ?? "");
      setMessage(result.message);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to request OTP.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const result = await verifyOtp({
        mobile_number: mobile,
        purpose: isRegister ? "register" : "login",
        otp,
        ...(isRegister ? { name: name.trim() } : {}),
      });

      saveAuthSession(result.token, result.user);
      navigate("/account", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">Savory<span>.</span></Link>

        <p className="auth-eyebrow">YOUR TABLE, YOUR WAY</p>
       <h1>
            {step === "otp"
                ? "Verify your number"
                : isRegister
                ? "Create your account"
                : "Welcome back"}
            </h1>

            <p className="auth-description">
            {step === "otp"
                ? `Enter the six-digit code for ${mobile}.`
                : isRegister
                ? "Create your Savory account and make ordering your favourites easier."
                : "Sign in with your mobile number to continue."}
            </p>

        {step === "mobile" ? (
          <form onSubmit={handleRequestOtp} className="auth-form">
            {isRegister && (
              <label>
                Full name
                <input
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  maxLength={100}
                  required
                />
              </label>
            )}

            <label>
              Mobile number
              <div className="mobile-input">
                <span>+91</span>
                <input
                  type="tel"
                  autoComplete="tel-national"
                  inputMode="numeric"
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit mobile number"
                  pattern="[6-9][0-9]{9}"
                  title="Enter a valid 10-digit Indian mobile number."
                  required
                />
              </div>
            </label>

            <button className="auth-submit" disabled={busy}>
              {busy ? "Please wait..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <label>
              Six-digit OTP
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter OTP"
                pattern="[0-9]{6}"
                minLength={6}
                maxLength={6}
                required
                autoFocus
              />
            </label>

            {developmentOtp && (
              <p className="auth-dev-code">
                Local development OTP: <strong>{developmentOtp}</strong>
              </p>
            )}

            <button className="auth-submit" disabled={busy || otp.length !== 6}>
              {busy ? "Verifying..." : "Verify and continue"}
            </button>

            <button
              type="button"
              className="auth-secondary"
              onClick={() => {
                setStep("mobile");
                setOtp("");
                setError("");
                setMessage("");
                setDevelopmentOtp("");
              }}
            >
              Change mobile number
            </button>
          </form>
        )}

        {message && <p className="auth-message">{message}</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}

        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "New to Savory?"}{" "}
          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Log in" : "Create an account"}
          </Link>
        </p>

        <Link to="/" className="auth-guest">Continue browsing as a guest</Link>
      </div>
    </section>
  );
}
