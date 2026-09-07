import { Scene, Video, VoiceSettings } from "@/types/video";
import { AuthUser, getAuthToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const MEDIA_URL = API_URL.replace(/\/api\/?$/, "");

export function mediaUrl(path: string) {
  return path.startsWith("http") ? path : `${MEDIA_URL}${path}`;
}

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

export async function updateProfile(profile: Pick<AuthUser, "email" | "first_name" | "last_name"> & {
  preferred_voice?: string;
  preferred_voice_settings?: VoiceSettings;
}) {
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

export async function createVideo(
  title: string,
  topic: string,
  template: string,
  visualStyle: string,
  voice: string,
  voiceSettings: VoiceSettings,
  backgroundMusic: string,
) {
  const response = await fetch(`${API_URL}/videos/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({
      title,
      topic,
      template,
      visual_style: visualStyle,
      voice,
      voice_settings: voiceSettings,
      background_music: backgroundMusic,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to create video"));
  }

  return response.json();
}

export async function requestPasswordReset(email: string) {
  const response = await fetch(`${API_URL}/auth/forgot-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error(await parseError(response, "Failed to request a password reset"));
  return response.json();
}

export async function resetPassword(uid: string, token: string, password: string) {
  const response = await fetch(`${API_URL}/auth/reset-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, token, password }),
  });
  if (!response.ok) throw new Error(await parseError(response, "Failed to reset password"));
  return response.json();
}

async function updateVideoRequest(path: string, method: string, body?: unknown): Promise<Video> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await parseError(response, "Failed to update script"));
  return response.json();
}

export function updateScene(videoId: number, sceneNumber: number, scene: Pick<Scene, "narration" | "visual_prompt">) {
  return updateVideoRequest(`/videos/${videoId}/scenes/${sceneNumber}/`, "PATCH", scene);
}

export function deleteScene(videoId: number, sceneNumber: number) {
  return updateVideoRequest(`/videos/${videoId}/scenes/${sceneNumber}/`, "DELETE");
}

export function addScene(videoId: number) {
  return updateVideoRequest(`/videos/${videoId}/scenes/`, "POST", {});
}

export async function regenerateScene(videoId: number, sceneNumber: number) {
  const response = await fetch(`${API_URL}/videos/${videoId}/scenes/${sceneNumber}/regenerate/`, { method: "POST", headers: authHeaders() });
  if (!response.ok) throw new Error(await parseError(response, "Failed to regenerate scene"));
}

export function generateVideo(videoId: number) {
  return updateVideoRequest(`/videos/${videoId}/generate/`, "POST");
}

export async function generateThumbnail(videoId: number) {
  const response = await fetch(`${API_URL}/videos/${videoId}/thumbnail/`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error(await parseError(response, "Failed to start thumbnail generation"));
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

export interface UsageSummary {
  account: {
    plan: "free" | "pro";
    credit_limit: number;
    credits_remaining: number;
    monthly_video_limit: number;
    videos_created_this_month: number;
    minutes_generated: number;
    preferred_voice: string;
    preferred_voice_settings: VoiceSettings;
  };
  videos_created: number;
  minutes_generated: number;
  credits_remaining: number;
  chart: Array<{ date: string; count: number }>;
}

export async function getUsage(): Promise<UsageSummary> {
  const response = await fetch(`${API_URL}/account/usage/`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error(await parseError(response, "Failed to fetch usage"));
  return response.json();
}
