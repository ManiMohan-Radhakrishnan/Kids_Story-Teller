// API client for communicating with the Kids Storytelling Bot backend

import axios, { AxiosInstance } from 'axios';
import {
  StoryStartRequest,
  StoryContinueRequest,
  StoryConfigRequest,
  StoryResponse,
  StoryConfigResponse,
  SessionInfoResponse,
  HealthResponse,
  FilterInfo,
  TutorStartRequest,
  TutorAskRequest,
  TutorResponse,
  ConfigRequest,
  ConfigResponse,
  SubjectInfo
} from '@/types/story';

class StoryAPI {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9999';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds timeout for story generation
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for API key if needed
    this.client.interceptors.request.use((config) => {
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;
      if (apiKey) {
        config.headers['X-API-Key'] = apiKey;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data) {
          // Backend returned an error response
          throw new APIError(
            error.response.data.error || 'API Error',
            error.response.data.detail,
            error.response.status,
            error.response.data.code
          );
        } else if (error.request) {
          // Network error
          throw new APIError(
            'Network Error',
            'Unable to connect to the story server. Please check your internet connection.',
            0
          );
        } else {
          // Other error
          throw new APIError(
            'Unknown Error',
            error.message,
            0
          );
        }
      }
    );
  }

  // Health check
  async checkHealth(): Promise<HealthResponse> {
    const response = await this.client.get<HealthResponse>('/health');
    return response.data;
  }

  // Get available content filters
  async getFilters(): Promise<FilterInfo> {
    const response = await this.client.get<FilterInfo>('/story/filters');
    return response.data;
  }

  // Start a new story
  async startStory(request: StoryStartRequest): Promise<StoryResponse> {
    const response = await this.client.post<StoryResponse>('/story/start', request);
    return response.data;
  }

  // Continue an existing story
  async continueStory(request: StoryContinueRequest): Promise<StoryResponse> {
    const response = await this.client.post<StoryResponse>('/story/continue', request);
    return response.data;
  }

  // Update story configuration
  async updateConfig(request: StoryConfigRequest): Promise<StoryConfigResponse> {
    const response = await this.client.put<StoryConfigResponse>('/story/config', request);
    return response.data;
  }

  // Get session information
  async getSessionInfo(sessionId: string): Promise<SessionInfoResponse> {
    const response = await this.client.get<SessionInfoResponse>(`/story/session/${sessionId}`);
    return response.data;
  }

  // Tutor Mode Endpoints

  // Start a new tutor session
  async startTutorSession(request: TutorStartRequest): Promise<TutorResponse> {
    const response = await this.client.post<TutorResponse>('/tutor/start', request);
    return response.data;
  }

  // Ask a question in tutor mode
  async askQuestion(request: TutorAskRequest): Promise<TutorResponse> {
    const response = await this.client.post<TutorResponse>('/tutor/ask', request);
    return response.data;
  }

  // Get tutor session information
  async getTutorSessionInfo(sessionId: string): Promise<SessionInfoResponse> {
    const response = await this.client.get<SessionInfoResponse>(`/tutor/session/${sessionId}`);
    return response.data;
  }

  // Get available subjects for tutor mode
  async getSubjects(): Promise<SubjectInfo> {
    const response = await this.client.get<SubjectInfo>('/tutor/subjects');
    return response.data;
  }

  // Shared Configuration Endpoints

  // Update session configuration (works for both story and tutor modes)
  async updateSessionConfig(request: ConfigRequest): Promise<ConfigResponse> {
    const response = await this.client.put<ConfigResponse>('/config/session', request);
    return response.data;
  }
}

// Custom error class for API errors
export class APIError extends Error {
  public detail?: string;
  public status: number;
  public code?: string;

  constructor(message: string, detail?: string, status: number = 0, code?: string) {
    super(message);
    this.name = 'APIError';
    this.detail = detail;
    this.status = status;
    this.code = code;
  }

  // User-friendly error messages for common scenarios
  getUserMessage(): string {
    switch (this.status) {
      case 404:
        return "Story session not found. It may have expired. Please start a new story.";
      case 400:
        return this.detail || "Invalid request. Please check your input and try again.";
      case 401:
        return "Authentication failed. Please check your API key.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
        return "Server error. Please try again later.";
      case 0:
        return this.detail || "Unable to connect to the server. Please check your internet connection.";
      default:
        return this.detail || this.message || "An unexpected error occurred.";
    }
  }
}

// Create and export a singleton instance
export const storyAPI = new StoryAPI();

// Helper functions for common operations
export const apiHelpers = {
  // Check if the backend is available
  async isBackendAvailable(): Promise<boolean> {
    try {
      await storyAPI.checkHealth();
      return true;
    } catch {
      return false;
    }
  },

  // Get user-friendly filter names
  getFilterDisplayName(filter: string): string {
    const names: Record<string, string> = {
      'moral_values': '🌟 Moral Values',
      'educational': '📚 Educational',
      'fun_only': '🎉 Fun Only'
    };
    return names[filter] || filter;
  },

  // Get age group display names
  getAgeGroupDisplayName(ageGroup: string): string {
    const names: Record<string, string> = {
      '3-5': '🧸 Little Ones (3-5 years)',
      '6-8': '🎈 Young Readers (6-8 years)',
      '9-12': '📖 Big Kids (9-12 years)'
    };
    return names[ageGroup] || ageGroup;
  },

  // Get story length display names
  getStoryLengthDisplayName(length: string): string {
    const names: Record<string, string> = {
      'short': '⚡ Quick Story',
      'medium': '📝 Medium Story', 
      'long': '📚 Long Adventure'
    };
    return names[length] || length;
  },

  // Format session duration
  formatSessionDuration(createdAt: string): string {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes === 1) return '1 minute ago';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  },

  // Get subject display names
  getSubjectDisplayName(subject: string): string {
    const names: Record<string, string> = {
      'math': 'Mathematics',
      'science': 'Science',
      'language': 'Language Arts',
      'social_studies': 'Social Studies',
      'art': 'Arts & Crafts',
      'general': 'General Knowledge'
    };
    return names[subject] || subject;
  },

  // Get mode display information
  getModeDisplayInfo(mode: 'story' | 'tutor'): { name: string; icon: string; description: string } {
    const modeInfo = {
      story: {
        name: 'Story Mode',
        icon: '📚',
        description: 'Create magical stories and adventures'
      },
      tutor: {
        name: 'Tutor Mode', 
        icon: '🎓',
        description: 'Ask questions and learn about anything'
      }
    };
    return modeInfo[mode];
  }
};
