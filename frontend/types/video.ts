export interface Video {
  id: number;
  title: string;
  topic: string;
  template: string;
  template_settings: TemplateSettings;
  visual_style: string;
  voice: string;
  voice_settings: VoiceSettings;
  background_music: string;
  script: string | null;
  scenes: Scene[];
  voice_url: string | null;
  captions_url: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  kie_task_id: string | null;
  status: VideoStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  progress: GenerationProgress;
}

export interface Scene {
  scene_number: number;
  narration: string;
  visual_prompt: string;
  status?: string;
}

export interface TemplateSettings {
  name: string;
  aspect_ratio: string;
  duration: string;
  scenes: number;
  voice: string;
  captions: boolean;
  music: boolean;
}

export interface VoiceSettings {
  speed: number;
  stability: number;
  similarity: number;
  custom_voice_id?: string;
}

export interface GenerationProgress {
  script: number;
  voice: number;
  scenes: Array<{
    scene_number: number;
    percent: number;
    status: string;
    retry_count: number;
  }>;
  final: number;
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
