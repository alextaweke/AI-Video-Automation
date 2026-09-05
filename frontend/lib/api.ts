import { Video } from "@/types/video";
import { AuthUser, getAuthToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

function authHeaders(): Record<string, string> {
  const token = getAuthToken();

  return token ? { Authorization: `Token ${token}` } : {};
}

async function parseError(response: Response, fallback: string) {
  try {
    const error = await response.json();

    return error.error || fallback;
  } catch {
    return fallback;
  }
}

export async function register(
  username: string,
  email: string,
  password: string,
) {
  const response = await fetch(`${API_URL}/auth/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to create account"));
  }

  return response.json();
}

export async function login(username: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to sign in"));
  }

  return response.json();
}

export async function logout() {
  await fetch(`${API_URL}/auth/logout/`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export async function updateProfile(profile: Pick<AuthUser, "email" | "first_name" | "last_name">) {
  const response = await fetch(`${API_URL}/auth/me/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to update profile"));
  }

  return response.json();
}

export async function createVideo(title: string, topic: string) {
  const response = await fetch(`${API_URL}/videos/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({
      title,
      topic,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to create video"));
  }

  return response.json();
}

export async function getVideo(id: number): Promise<Video> {
  const response = await fetch(`${API_URL}/videos/${id}/`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to fetch video"));
  }

  return response.json();
}
export async function getVideos(): Promise<Video[]> {
  const response = await fetch(`${API_URL}/videos/`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to fetch videos"));
  }

  return response.json();
}
