import { Video } from "@/types/video";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function createVideo(title: string, topic: string) {
  const response = await fetch(`${API_URL}/videos/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      topic,
    }),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.error || "Failed to create video");
  }

  return response.json();
}

export async function getVideo(id: number): Promise<Video> {
  const response = await fetch(`${API_URL}/videos/${id}/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch video");
  }

  return response.json();
}
export async function getVideos(): Promise<Video[]> {
  const response = await fetch(`${API_URL}/videos/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch videos");
  }

  return response.json();
}
