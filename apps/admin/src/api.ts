
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

export interface Admin {
  id: number;
  name: string;
  email: string;
}

export interface Project {
  id: number;
  name: string;
  public_key: string;
  server_key?: string;
  created_at: string;
}

export interface Summary {
  total_events: number;
  page_views: number;
  unique_visitors: number;
  unique_sessions: number;
  orders_created: number;
  order_value: number;
}

export interface PopularPage {
  path: string | null;
  views: number;
}

export interface EventTrend {
  date: string;
  event_name: string;
  total: number;
}

async function request<T>(
  path: string,
  token?: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body?.message ??
      (response.status === 401
        ? "Your session expired. Please sign in again."
        : `Request failed (${response.status})`);

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  return request<{ token: string; admin: Admin }>("/admin/login", undefined, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getProjects(token: string) {
  return request<{ projects: Project[] }>("/admin/projects", token);
}

export function createProject(token: string, name: string) {
  return request<{
    message: string;
    project: Project;
  }>("/admin/projects", token, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function getSummary(
  token: string,
  publicKey: string,
  from: string,
  to: string,
) {
  return request<Summary>(
    `/analytics/summary?${new URLSearchParams({
      public_key: publicKey,
      from,
      to,
    })}`,
    token,
  );
}

export function getPopularPages(
  token: string,
  publicKey: string,
  from: string,
  to: string,
) {
  return request<{ pages: PopularPage[] }>(
    `/analytics/popular-pages?${new URLSearchParams({
      public_key: publicKey,
      from,
      to,
    })}`,
    token,
  );
}

export function getEventTrends(
  token: string,
  publicKey: string,
  from: string,
  to: string,
) {
  return request<{ trends: EventTrend[] }>(
    `/analytics/event-trends?${new URLSearchParams({
      public_key: publicKey,
      from,
      to,
    })}`,
    token,
  );
}

export async function logout(token: string) {
  return request<{ message: string }>("/admin/logout", token, {
    method: "POST",
  });

}


export async function register(
  name: string,
  email: string,
  password: string,
  password_confirmation: string,
) {
  return request<{
    token: string;
    admin: Admin;
    message: string;
  }>("/admin/register", undefined, {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation,
    }),
  });
}
