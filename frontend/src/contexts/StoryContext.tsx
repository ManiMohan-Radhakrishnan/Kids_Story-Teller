'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { 
  StoryResponse, 
  StoryStartRequest, 
  StoryContinueRequest,
  TutorResponse,
  TutorStartRequest,
  TutorAskRequest,
  ContentFilter,
  AgeGroup,
  StoryLength,
  SessionMode,
  FilterInfo,
  SubjectInfo 
} from '@/types/story';
import { storyAPI, APIError } from '@/lib/api';

// App state interface (renamed from StoryState to support both modes)
interface AppState {
  // Current mode
  mode: SessionMode;
  
  // Session data
  sessionId?: string;
  
  // Story mode data
  storyContent: string[];
  userInputs: string[];
  isComplete: boolean;
  wordCount: number;
  messageCount: number;
  
  // Tutor mode data
  tutorAnswers: string[];
  tutorQuestions: string[];
  currentSubject?: string;
  followUpSuggestions: string[];
  
  // Configuration
  contentFilter: ContentFilter;
  ageGroup: AgeGroup;
  storyLength: StoryLength;
  characterName?: string;
  
  // UI state
  isLoading: boolean;
  error?: string;
  isGenerating: boolean;
  showModeSelector: boolean;
  
  // Available options
  availableFilters?: FilterInfo;
  availableSubjects?: SubjectInfo;
  
  // Creation state
  currentPrompt?: string;
  currentQuestion?: string;
}

// Actions
type AppAction =
  | { type: 'SET_MODE'; payload: SessionMode }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_FILTERS'; payload: FilterInfo }
  | { type: 'SET_SUBJECTS'; payload: SubjectInfo }
  | { type: 'SET_CONFIG'; payload: Partial<Pick<AppState, 'contentFilter' | 'ageGroup' | 'storyLength' | 'characterName'>> }
  | { type: 'SET_PROMPT'; payload: string }
  | { type: 'SET_QUESTION'; payload: string }
  | { type: 'START_STORY'; payload: StoryResponse }
  | { type: 'CONTINUE_STORY'; payload: { response: StoryResponse; userInput: string } }
  | { type: 'START_TUTOR'; payload: TutorResponse }
  | { type: 'ASK_QUESTION'; payload: { response: TutorResponse; question: string } }
  | { type: 'RESET_SESSION' }
  | { type: 'SHOW_MODE_SELECTOR'; payload: boolean };

// Initial state  
const initialState: AppState = {
  mode: 'story', // Default to story mode, but will show mode selector first
  storyContent: [],
  userInputs: [],
  tutorAnswers: [],
  tutorQuestions: [],
  followUpSuggestions: [],
  isComplete: false,
  wordCount: 0,
  messageCount: 0,
  contentFilter: 'educational',
  ageGroup: '6-8',
  storyLength: 'medium',
  isLoading: false,
  isGenerating: false,
  showModeSelector: true, // Start with mode selector
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_MODE':
      return { 
        ...initialState,
        mode: action.payload,
        showModeSelector: false, // Hide mode selector after selection
        availableFilters: state.availableFilters,
        availableSubjects: state.availableSubjects,
        contentFilter: state.contentFilter,
        ageGroup: state.ageGroup,
        storyLength: state.storyLength,
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, isGenerating: false };
    
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, availableFilters: action.payload };
    
    case 'SET_SUBJECTS':
      return { ...state, availableSubjects: action.payload };
    
    case 'SET_CONFIG':
      return { ...state, ...action.payload };
    
    case 'SET_PROMPT':
      return { ...state, currentPrompt: action.payload };
    
    case 'SET_QUESTION':
      return { ...state, currentQuestion: action.payload };
    
    case 'START_STORY':
      return {
        ...state,
        mode: 'story',
        sessionId: action.payload.session_id,
        storyContent: [action.payload.story_content],
        userInputs: [],
        isComplete: action.payload.is_complete,
        wordCount: action.payload.word_count,
        messageCount: action.payload.message_count,
        contentFilter: action.payload.content_filter_applied as ContentFilter,
        isLoading: false,
        isGenerating: false,
        error: undefined,
      };
    
    case 'CONTINUE_STORY':
      return {
        ...state,
        storyContent: [...state.storyContent, action.payload.response.story_content],
        userInputs: [...state.userInputs, action.payload.userInput],
        isComplete: action.payload.response.is_complete,
        wordCount: action.payload.response.word_count,
        messageCount: action.payload.response.message_count,
        isLoading: false,
        isGenerating: false,
        error: undefined,
      };
    
    case 'START_TUTOR':
      return {
        ...state,
        mode: 'tutor',
        sessionId: action.payload.session_id,
        tutorAnswers: [action.payload.answer],
        tutorQuestions: [],
        currentSubject: action.payload.subject_detected,
        followUpSuggestions: action.payload.follow_up_suggestions || [],
        messageCount: action.payload.message_count,
        contentFilter: action.payload.content_filter_applied as ContentFilter,
        isLoading: false,
        isGenerating: false,
        error: undefined,
      };
    
    case 'ASK_QUESTION':
      return {
        ...state,
        tutorAnswers: [...state.tutorAnswers, action.payload.response.answer],
        tutorQuestions: [...state.tutorQuestions, action.payload.question],
        currentSubject: action.payload.response.subject_detected || state.currentSubject,
        followUpSuggestions: action.payload.response.follow_up_suggestions || [],
        messageCount: action.payload.response.message_count,
        isLoading: false,
        isGenerating: false,
        error: undefined,
      };
    
    case 'RESET_SESSION':
      return {
        ...initialState,
        showModeSelector: true, // Show mode selector when resetting
        availableFilters: state.availableFilters,
        availableSubjects: state.availableSubjects,
        contentFilter: state.contentFilter,
        ageGroup: state.ageGroup,
        storyLength: state.storyLength,
        mode: state.mode,
      };

    case 'SHOW_MODE_SELECTOR':
      return { ...state, showModeSelector: action.payload };
    
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  
  // Mode actions
  setMode: (mode: SessionMode) => void;
  showModeSelector: () => void;
  
  // Shared actions
  setConfig: (config: Partial<Pick<AppState, 'contentFilter' | 'ageGroup' | 'storyLength' | 'characterName'>>) => void;
  resetSession: () => void;
  loadFilters: () => Promise<void>;
  loadSubjects: () => Promise<void>;
  clearError: () => void;
  
  // Story actions
  setPrompt: (prompt: string) => void;
  startStory: (prompt: string) => Promise<void>;
  continueStory: (userInput: string) => Promise<void>;
  
  // Tutor actions
  setQuestion: (question: string) => void;
  startTutor: (request: TutorStartRequest) => Promise<void>;
  askQuestion: (question: string, subjectHint?: string) => Promise<void>;
  
  // Computed values
  hasActiveSession: boolean;
  canContinue: boolean;
  canAsk: boolean;
  totalWordCount: number;
  storyProgress: number;
  currentModeInfo: { name: string; icon: string; description: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component (renamed but keeping StoryProvider for backward compatibility)
export function StoryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Mode actions
  const setMode = useCallback((mode: SessionMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  const showModeSelector = useCallback(() => {
    dispatch({ type: 'SHOW_MODE_SELECTOR', payload: true });
  }, []);

  // Load available filters
  const loadFilters = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const filters = await storyAPI.getFilters();
      dispatch({ type: 'SET_FILTERS', payload: filters });
    } catch (error) {
      const apiError = error as APIError;
      dispatch({ type: 'SET_ERROR', payload: apiError.getUserMessage() });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Load available subjects
  const loadSubjects = useCallback(async () => {
    try {
      const subjects = await storyAPI.getSubjects();
      dispatch({ type: 'SET_SUBJECTS', payload: subjects });
    } catch (error) {
      const apiError = error as APIError;
      dispatch({ type: 'SET_ERROR', payload: apiError.getUserMessage() });
    }
  }, []);

  // Set configuration
  const setConfig = useCallback((config: Partial<Pick<AppState, 'contentFilter' | 'ageGroup' | 'storyLength' | 'characterName'>>) => {
    dispatch({ type: 'SET_CONFIG', payload: config });
  }, []);

  // Set prompt
  const setPrompt = useCallback((prompt: string) => {
    dispatch({ type: 'SET_PROMPT', payload: prompt });
  }, []);

  // Set question
  const setQuestion = useCallback((question: string) => {
    dispatch({ type: 'SET_QUESTION', payload: question });
  }, []);

  // Start a new story
  const startStory = useCallback(async (prompt: string) => {
    try {
      dispatch({ type: 'SET_GENERATING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: undefined });

      const request: StoryStartRequest = {
        prompt,
        character_name: state.characterName,
        age_group: state.ageGroup,
        story_length: state.storyLength,
        content_filter: state.contentFilter,
      };

      const response = await storyAPI.startStory(request);
      dispatch({ type: 'START_STORY', payload: response });
    } catch (error) {
      const apiError = error as APIError;
      dispatch({ type: 'SET_ERROR', payload: apiError.getUserMessage() });
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  }, [state.characterName, state.ageGroup, state.storyLength, state.contentFilter]);

  // Continue the story
  const continueStory = useCallback(async (userInput: string) => {
    if (!state.sessionId) {
      dispatch({ type: 'SET_ERROR', payload: 'No active story session' });
      return;
    }

    try {
      dispatch({ type: 'SET_GENERATING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: undefined });

      const request: StoryContinueRequest = {
        session_id: state.sessionId,
        user_input: userInput,
      };

      const response = await storyAPI.continueStory(request);
      dispatch({ type: 'CONTINUE_STORY', payload: { response, userInput } });
    } catch (error) {
      const apiError = error as APIError;
      dispatch({ type: 'SET_ERROR', payload: apiError.getUserMessage() });
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  }, [state.sessionId]);

  // Start a new tutor session
  const startTutor = useCallback(async (request: TutorStartRequest) => {
    try {
      dispatch({ type: 'SET_GENERATING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: undefined });

      const tutorRequest: TutorStartRequest = {
        ...request,
        age_group: request.age_group || state.ageGroup,
        content_filter: request.content_filter || state.contentFilter,
      };

      const response = await storyAPI.startTutorSession(tutorRequest);
      dispatch({ type: 'START_TUTOR', payload: response });
    } catch (error) {
      const apiError = error as APIError;
      dispatch({ type: 'SET_ERROR', payload: apiError.getUserMessage() });
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  }, [state.ageGroup, state.contentFilter]);

  // Ask a question in tutor mode
  const askQuestion = useCallback(async (question: string, subjectHint?: string) => {
    if (!state.sessionId) {
      dispatch({ type: 'SET_ERROR', payload: 'No active tutor session' });
      return;
    }

    try {
      dispatch({ type: 'SET_GENERATING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: undefined });

      const request: TutorAskRequest = {
        session_id: state.sessionId,
        question,
        subject_hint: subjectHint,
      };

      const response = await storyAPI.askQuestion(request);
      dispatch({ type: 'ASK_QUESTION', payload: { response, question } });
    } catch (error) {
      const apiError = error as APIError;
      dispatch({ type: 'SET_ERROR', payload: apiError.getUserMessage() });
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  }, [state.sessionId]);

  // Reset session
  const resetSession = useCallback(() => {
    dispatch({ type: 'RESET_SESSION' });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: undefined });
  }, []);

  // Computed values
  const hasActiveSession = Boolean(state.sessionId);
  const canContinue = hasActiveSession && state.mode === 'story' && !state.isComplete && !state.isGenerating;
  const canAsk = hasActiveSession && state.mode === 'tutor' && !state.isGenerating;
  const totalWordCount = state.storyContent.reduce((total, content) => total + content.split(' ').length, 0);
  const storyProgress = Math.min((totalWordCount / 1000) * 100, 100);
  const currentModeInfo = {
    story: { name: 'Story Mode', icon: '📚', description: 'Create magical stories and adventures' },
    tutor: { name: 'Tutor Mode', icon: '🎓', description: 'Ask questions and learn about anything' }
  }[state.mode];

  const contextValue: AppContextType = {
    state,
    setMode,
    showModeSelector,
    setConfig,
    resetSession,
    loadFilters,
    loadSubjects,
    clearError,
    setPrompt,
    startStory,
    continueStory,
    setQuestion,
    startTutor,
    askQuestion,
    hasActiveSession,
    canContinue,
    canAsk,
    totalWordCount,
    storyProgress,
    currentModeInfo,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the app context (keeping useStory for backward compatibility)
export function useStory() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useStory must be used within a StoryProvider');
  }
  return context;
}

// New hook with better name
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within a StoryProvider');
  }
  return context;
}
