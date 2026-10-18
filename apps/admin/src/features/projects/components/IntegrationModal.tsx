
import { useState } from "react";
import { Check, Copy, X, ShieldCheck, Globe } from "lucide-react";
import type { Project } from "../../../api";

interface IntegrationModalProps {
  project: Project;
  onClose: () => void;
}

type SdkType = "browser" | "laravel";

export default function IntegrationModal({
  project,
  onClose,
}: IntegrationModalProps) {
  const [copied, setCopied] = useState("");
  const [sdkType, setSdkType] = useState<SdkType>("browser");

  const browserInstall = "npm install @pulsetrack/browser-sdk";

  const browserSetup = `import { PulseTrack } from "@pulsetrack/browser-sdk";

export const analytics = new PulseTrack({
  endpoint: "YOUR_API_ENDPOINT",
  projectKey: "${project.public_key}",
});`;

  const browserEvent = `analytics.track("signup_completed", {
  method: "email",
});`;

  const laravelInstall = "composer require pulsetrack/server-sdk";

  const laravelEnv = `PULSETRACK_ENDPOINT=YOUR_API_ENDPOINT
PULSETRACK_PUBLIC_KEY=${project.public_key}
PULSETRACK_SERVER_KEY=${project.server_key ?? "YOUR_SERVER_KEY"}
PULSETRACK_TIMEOUT=5`;

  const laravelEvent = `use PulseTrack\\ServerSdk\\PulseTrack;

class OrderController
{
    public function __construct(
        private readonly PulseTrack $pulsetrack,
    ) {}

    public function store()
    {
        // Call after the order has been successfully created.
        $this->pulsetrack->track('order_created', [
            'order_id' => 123,
            'total_amount' => 299,
            'currency' => 'INR',
        ]);

        // Continue your existing order logic.
    }
}`;

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
    } catch {
      window.prompt("Copy this text:", value);
    }
  }

  const buttonStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 14px",
    border: "1px solid #dfe4ef",
    borderRadius: 8,
    background: "#fff",
    color: "#5968e8",
    cursor: "pointer",
    fontWeight: 600,
  } as const;

  const codeStyle = {
    overflowX: "auto" as const,
    whiteSpace: "pre" as const,
    padding: 18,
    borderRadius: 10,
    background: "#171e33",
    color: "#e2e8ff",
    fontSize: 12,
    lineHeight: 1.8,
  };

  function CodeSection({
    title,
    code,
    label,
    note,
  }: {
    title: string;
    code: string;
    label: string;
    note?: string;
  }) {
    return (
      <section>
        <h3 style={{ fontSize: 15 }}>{title}</h3>

        <pre style={codeStyle}>
          <code>{code}</code>
        </pre>

        <button
          type="button"
          style={buttonStyle}
          onClick={() => void copyText(code, label)}
        >
          {copied === label ? <Check size={16} /> : <Copy size={16} />}
          {copied === label ? "Copied" : "Copy code"}
        </button>

        {note && (
          <p style={{ color: "#8994aa", fontSize: 12, lineHeight: 1.6 }}>
            {note}
          </p>
        )}
      </section>
    );
  }

  const serverKeyAvailable = Boolean(project.server_key);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(15, 23, 42, 0.68)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="integration-title"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(720px, 100%)",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 25px 80px rgba(0,0,0,.3)",
          color: "#293451",
        }}
      >
        <header
          style={{
            padding: 24,
            borderBottom: "1px solid #edf0f6",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <span style={{ color: "#15945b", fontWeight: 700, fontSize: 12 }}>
              <Check size={14} style={{ verticalAlign: "middle" }} /> PROJECT
              {" "}INTEGRATION
            </span>

            <h2 id="integration-title" style={{ margin: "10px 0 6px" }}>
              {project.name} integration
            </h2>

            <p style={{ margin: 0, color: "#8994aa", fontSize: 14 }}>
              Connect your application to PulseTrack analytics.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close integration popup"
            style={{ ...buttonStyle, padding: 8, color: "#293451" }}
          >
            <X size={20} />
          </button>
        </header>

        <div style={{ padding: 24, display: "grid", gap: 24 }}>
          {/* Public project key */}
          <section>
            <h3 style={{ fontSize: 15 }}>
              <Globe
                size={16}
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              Public project key
            </h3>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: 12,
                border: "1px solid #e1e6f0",
                borderRadius: 10,
                background: "#f8f9fc",
              }}
            >
              <code style={{ overflowWrap: "anywhere" }}>
                {project.public_key}
              </code>

              <button
                type="button"
                style={buttonStyle}
                onClick={() => void copyText(project.public_key, "public-key")}
              >
                {copied === "public-key" ? (
                  <Check size={16} />
                ) : (
                  <Copy size={16} />
                )}
                {copied === "public-key" ? "Copied" : "Copy key"}
              </button>
            </div>

            <p style={{ color: "#8994aa", fontSize: 12 }}>
              Use this key in your browser SDK. It identifies your project
              and is not a secret.
            </p>
          </section>

          {/* SDK tabs */}
          <div
            role="tablist"
            aria-label="SDK type"
            style={{
              display: "flex",
              gap: 8,
              padding: 5,
              background: "#f1f3f9",
              borderRadius: 10,
            }}
          >
            {(["browser", "laravel"] as const).map((type) => (
              <button
                key={type}
                type="button"
                role="tab"
                aria-selected={sdkType === type}
                onClick={() => {
                  setSdkType(type);
                  setCopied("");
                }}
                style={{
                  ...buttonStyle,
                  flex: 1,
                  background: sdkType === type ? "#fff" : "transparent",
                  borderColor:
                    sdkType === type ? "#dfe4ef" : "transparent",
                  color: sdkType === type ? "#5968e8" : "#69758d",
                }}
              >
                {type === "browser" ? "Browser SDK" : "Laravel Server SDK"}
              </button>
            ))}
          </div>

          {sdkType === "browser" ? (
            <>
              <CodeSection
                title="1. Install the browser SDK"
                code={browserInstall}
                label="browser-install"
                note="Run this command in your frontend application."
              />

              <CodeSection
                title="2. Initialize PulseTrack"
                code={browserSetup}
                label="browser-setup"
                note="Replace YOUR_API_ENDPOINT with your actual PulseTrack API URL."
              />

              <CodeSection
                title="3. Track a browser event"
                code={browserEvent}
                label="browser-event"
              />
            </>
          ) : (
            <>
              <CodeSection
                title="1. Install the Laravel Server SDK"
                code={laravelInstall}
                label="laravel-install"
                note="Run this in your Laravel backend application."
              />

              <section>
                <h3 style={{ fontSize: 15 }}>
                  <ShieldCheck
                    size={17}
                    style={{ verticalAlign: "middle", marginRight: 8 }}
                  />
                  2. Server secret key
                </h3>

                {serverKeyAvailable ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: 12,
                        border: "1px solid #f3dfad",
                        borderRadius: 10,
                        background: "#fff8e8",
                      }}
                    >
                      <code style={{ overflowWrap: "anywhere" }}>
                        {project.server_key}
                      </code>

                      <button
                        type="button"
                        style={buttonStyle}
                        onClick={() =>
                          void copyText(
                            project.server_key!,
                            "server-key",
                          )
                        }
                      >
                        {copied === "server-key" ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                        {copied === "server-key" ? "Copied" : "Copy secret"}
                      </button>
                    </div>

                    <p
                      style={{
                        color: "#76551b",
                        fontSize: 12,
                        lineHeight: 1.6,
                      }}
                    >
                      Generated by PulseTrack when this project was created.
                      Copy it now and save it securely. It authenticates
                      server-side events. Never expose it in browser code,
                      source control, or public logs.
                    </p>
                  </>
                ) : (
                  <div
                    role="alert"
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      background: "#fff8e8",
                      border: "1px solid #f3dfad",
                      color: "#76551b",
                      fontSize: 13,
                      lineHeight: 1.7,
                    }}
                  >
                    The server secret was not returned by the API. For
                    security, it cannot be recovered from its stored hash.
                    Implement a server-key rotation endpoint to generate a
                    replacement before using server-side tracking.
                  </div>
                )}
              </section>

              <CodeSection
                title="3. Configure your backend .env file"
                code={laravelEnv}
                label="laravel-env"
                note="Copy these settings into your Laravel application's .env file. Replace YOUR_API_ENDPOINT with your PulseTrack API base URL. Keep the server key in the backend only."
              />

              <CodeSection
                title="4. Track a server-side event"
                code={laravelEvent}
                label="laravel-event"
                note="Call this after the order has actually been created. Adapt the example to your application and avoid tracking the same event from both browser and server."
              />

              <section
                style={{
                  padding: 14,
                  borderRadius: 10,
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                }}
              >
                <h3 style={{ fontSize: 14, marginTop: 0 }}>
                  Server-side authentication
                </h3>

                <p
                  style={{
                    marginBottom: 0,
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: "#166534",
                  }}
                >
                  The Laravel SDK sends the server key as a Bearer token.
                  PulseTrack must validate it against the project's stored
                  server-key hash before accepting server events. Browser
                  events use the public key and do not need this secret.
                </p>
              </section>
            </>
          )}
        </div>

        <footer
          style={{
            padding: 20,
            borderTop: "1px solid #edf0f6",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              ...buttonStyle,
              background: "#5968e8",
              color: "#fff",
              border: 0,
              padding: "12px 24px",
            }}
          >
            Done
          </button>
        </footer>
      </section>
    </div>
  );
}
