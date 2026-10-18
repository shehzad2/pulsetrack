import { useState } from "react";
import { Activity, Eye, Users, Zap, ShieldCheck } from "lucide-react";
import type { Admin } from "../../../api";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface AuthPageProps {
  onSuccess: (token: string, admin: Admin) => void;
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="brand brand-login">
          <span className="brand-mark">
            <Activity size={23} />
          </span>
          <span>PulseTrack</span>
        </div>

        {mode === "login" ? (
          <LoginForm
            onSuccess={onSuccess}
            onRegisterClick={() => setMode("register")}
          />
        ) : (
          <RegisterForm
            onSuccess={onSuccess}
            onLoginClick={() => setMode("login")}
          />
        )}

        <div className="login-footnote">
          <ShieldCheck size={16} />
          Secure access to your analytics workspace
        </div>
      </section>

      <div className="login-decoration">
        <div className="decoration-orb orb-one" />
        <div className="decoration-orb orb-two" />
        <div className="decoration-content">
          <span className="eyebrow">YOUR DATA, IN FOCUS</span>
          <h2>Make every visit count.</h2>
          <p>
            Understand how visitors explore your website, one event at a time.
          </p>
          <div className="decoration-stats">
            <span><Eye size={18} /> Page views</span>
            <span><Users size={18} /> Visitors</span>
            <span><Zap size={18} /> Events</span>
          </div>
        </div>
      </div>
    </main>
  );
}
