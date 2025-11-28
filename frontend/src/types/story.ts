// TypeScript types for the Kids Storytelling Bot

export interface StoryStartRequest {
  prompt: string;
  character_name?: string;
  age_group?: "3-5" | "6-8" | "9-12";
  story_length?: "short" | "medium" | "long";
  content_filter?: "moral_values" | "educational" | "fun_only";
}

export interface StoryContinueRequest {
  session_id: string;
  user_input: string;
  choice?: string;
}

export interface StoryConfigRequest {
  session_id: string;
  content_filter?: "moral_values" | "educational" | "fun_only";
  max_story_length?: number;
  story_style?: string;
}

export interface StoryMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface StoryResponse {
  session_id: string;
  story_content: string;
  choices?: string[];
  is_complete: boolean;
  word_count: number;
  content_filter_applied: string;
  message_count: number;
}

export interface StoryConfigResponse {
  session_id: string;
  config: Record<string, unknown>;
  message: string;
}

export interface SessionInfoResponse {
  session_id: string;
  created_at: string;
  last_accessed: string;
  message_count: number;
  config: Record<string, unknown>;
  is_expired: boolean;
}

export interface ErrorResponse {
  error: string;
  detail?: string;
  code?: string;
}

export interface HealthResponse {
  status: "healthy" | "unhealthy";
  version: string;
  llm_provider: string;
  session_backend: string;
  timestamp: string;
}

export interface FilterInfo {
  available_filters: string[];
  descriptions: Record<string, string>;
  default_filter: string;
}

export type ContentFilter = "moral_values" | "educational" | "fun_only";
export type AgeGroup = "3-5" | "6-8" | "9-12";
export type StoryLength = "short" | "medium" | "long";
export type SessionMode = "story" | "tutor";

// Tutor Mode Types

export interface TutorStartRequest {
  subject?: string;
  age_group?: AgeGroup;
  content_filter?: ContentFilter;
  initial_question?: string;
}

export interface TutorAskRequest {
  session_id: string;
  question: string;
  subject_hint?: string;
}

export interface TutorResponse {
  session_id: string;
  answer: string;
  subject_detected?: string;
  follow_up_suggestions?: string[];
  educational_level: string;
  content_filter_applied: string;
  message_count: number;
  is_appropriate: boolean;
}

export interface ConfigRequest {
  session_id: string;
  content_filter?: ContentFilter;
  age_group?: AgeGroup;
  additional_settings?: Record<string, unknown>;
}

export interface ConfigResponse {
  session_id: string;
  mode: SessionMode;
  config: Record<string, unknown>;
  message: string;
}

export interface SubjectInfo {
  available_subjects: string[];
  subject_descriptions: Record<string, string>;
  example_questions: Record<string, string[]>;
}
