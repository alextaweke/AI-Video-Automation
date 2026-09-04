export interface Video {
  id: number;
  title: string;
  topic: string;
  script: string | null;
  voice_url: string | null;
  video_url: string | null;
  kie_task_id: string | null;
  status: VideoStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export type VideoStatus =
  | "pending"
  | "script_generating"
  | "script_ready"
  | "voice_generating"
  | "video_generating"
  | "processing"
  | "completed"
  | "failed";
