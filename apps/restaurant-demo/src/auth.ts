
const API_URL = "http://127.0.0.1:8000/api/v1";
const TOKEN_KEY = "savory_auth_token";

export interface AuthUser {
  id: number;
  name: string;
  mobile_number: string;
}

interface OtpResponse {
  message: string;
  development_otp?: string;
}

interface VerifyResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveAuthSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem("savory_auth_user", JSON.stringify(user));
}

export function getSavedUser(): AuthUser | null {
  try {
    const value = localStorage.getItem("savory_auth_user");
    return value ? (JSON.parse(value) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("savory_auth_user");
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  if (!response.ok) {
    const validationErrors = result.errors
      ? Object.values(result.errors).flat().join(" ")
      : "";

    throw new Error(validationErrors || result.message || "Request failed.");
  }

  return result as T;
}

export function requestOtp(data: {
  mobile_number: string;
  purpose: "register" | "login";
  name?: string;
}): Promise<OtpResponse> {
  return postJson<OtpResponse>("/auth/request-otp", data);
}

export function verifyOtp(data: {
  mobile_number: string;
  purpose: "register" | "login";
  otp: string;
  name?: string;
}): Promise<VerifyResponse> {
  return postJson<VerifyResponse>("/auth/verify-otp", data);
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Your session has expired. Please log in again.");
  }

  const result = await response.json();
  return result.user as AuthUser;
}

export async function logoutRequest(): Promise<void> {
  const token = getAuthToken();

  if (!token) return;

  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Could not log out from the server.");
  }
}
