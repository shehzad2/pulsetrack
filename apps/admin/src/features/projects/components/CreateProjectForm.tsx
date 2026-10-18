
import { useState, type FormEvent } from "react";
import { Globe } from "lucide-react";
import { createProject, type Project } from "../../../api";
import IntegrationModal from "./IntegrationModal";

interface CreateProjectFormProps {
  token: string;
  onCreated: (project: Project) => void;
}

export default function CreateProjectForm({
  token,
  onCreated,
}: CreateProjectFormProps) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [project, setProject] = useState<Project | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setError("Name must contain between 2 and 100 characters.");
      return;
    }

    setBusy(true);

    try {
      const result = await createProject(token, trimmedName);

      setProject(result.project);
      setName("");
      onCreated(result.project);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create project.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="panel create-project-panel">
        <div className="panel-heading">
          <div>
            <h3>Create a project</h3>
            <p>Connect a website or application to PulseTrack.</p>
          </div>

          <span className="panel-icon">
            <Globe size={18} />
          </span>
        </div>

        <form onSubmit={handleSubmit} className="create-project-form">
          <label htmlFor="project-name">Project name</label>

          <div className="create-project-controls">
            <input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="My Website"
              minLength={2}
              maxLength={100}
              required
            />

            <button
              type="submit"
              className="primary-button"
              disabled={busy}
            >
              {busy ? "Creating..." : "Create project"}
            </button>
          </div>
        </form>

        {error && <div className="error-banner">{error}</div>}
      </section>

      {project && (
        <IntegrationModal
          project={project}
          onClose={() => setProject(null)}
        />
      )}
    </>
  );
}
