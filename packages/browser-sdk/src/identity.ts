const VISITOR_KEY = "pulsetrack_visitor_id";
const SESSION_KEY = "pulsetrack_session_id";
const LAST_ACTIVITY_KEY = "pulsetrack_last_activity";

function createId(): string {
  return crypto.randomUUID();
}

export function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);

    if (!id) {
      id = createId();
      localStorage.setItem(VISITOR_KEY, id);
    }

    return id;
  } catch {
    return createId();
  }
}

export function getSessionId(): string {
  const now = Date.now();
  const timeout = 30 * 60 * 1000;

  try {
    const lastActivity = Number(
      sessionStorage.getItem(LAST_ACTIVITY_KEY) || 0
    );

    let id = sessionStorage.getItem(SESSION_KEY);

    if (!id || now - lastActivity > timeout) {
      id = createId();
      sessionStorage.setItem(SESSION_KEY, id);
    }

    sessionStorage.setItem(LAST_ACTIVITY_KEY, String(now));

    return id;
  } catch {
    return createId();
  }
}
