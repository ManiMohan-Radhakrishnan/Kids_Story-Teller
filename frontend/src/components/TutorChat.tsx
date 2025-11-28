'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RotateCcw, Settings, GraduationCap, MessageCircle, Lightbulb, BookOpen, Mic, MicOff, Loader2 } from 'lucide-react';
import { useStory } from '@/contexts/StoryContext';
import { Button } from '@/components/ui/Button';
import { MagicalInput } from '@/components/ui/Input';
import { TutorThinkingLoader } from '@/components/ui/LoadingSpinner';

export function TutorChat() {
  const {
    state,
    askQuestion,
    resetSession,
    canAsk
  } = useStory();

  const [userQuestion, setUserQuestion] = useState('');
  const [inputError, setInputError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.tutorAnswers, state.isGenerating]);

  const handleAskQuestion = async () => {
    if (!userQuestion.trim()) {
      setInputError('Please ask me a question!');
      return;
    }

    if (userQuestion.trim().length < 3) {
      setInputError('Please give me a bit more detail!');
      return;
    }

    setInputError('');
    const questionToAsk = userQuestion.trim();
    setUserQuestion(''); // Clear input immediately for better UX
    await askQuestion(questionToAsk, state.currentSubject);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canAsk && userQuestion.trim()) {
        handleAskQuestion();
      }
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setInputError('');
    setUserQuestion(''); // Clear input immediately
    await askQuestion(suggestion, state.currentSubject);
  };

  const handleNewSession = () => {
    resetSession();
  };

  // Function to handle mic button click
  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Function to start recording
  const startRecording = () => {
    setIsRecording(true);
    console.log('Recording started');
  };

  // Function to stop recording
  const stopRecording = () => {
    setIsRecording(false);
    console.log('Recording stopped');
    setAudioBlob(new Blob());
  };

  // Function to send audio to backend
  const sendAudioToBackend = async () => {
    if (!audioBlob) return;
    console.log('Sending audio to backend');
  };

  useEffect(() => {
    if (audioBlob) {
      sendAudioToBackend();
    }
  }, [audioBlob]);

  const getSubjectName = (subject?: string) => {
    const names: Record<string, string> = {
      'math': 'Mathematics',
      'science': 'Science',
      'language': 'Language Arts',
      'social_studies': 'Social Studies',
      'art': 'Arts & Crafts',
      'general': 'General Knowledge'
    };
    return names[subject || 'general'] || 'General Knowledge';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with progress */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-400 mr-3">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground/90">
              Learning Session
            </h1>
          </div>

          {/* Subject indicator */}
          {state.currentSubject && (
            <div className="hidden sm:flex items-center space-x-2 text-sm text-accent font-medium bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <span>{getSubjectName(state.currentSubject)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="secondary"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            onClick={handleNewSession}
            variant="secondary"
            size="sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>
      </motion.div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-[2rem] shadow-sm border border-white">
              <h3 className="text-lg font-heading font-bold text-foreground/80 mb-4">
                Learning Session Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="font-medium text-muted-foreground">Learning Style</p>
                  <p className="text-accent font-semibold capitalize">
                    {state.contentFilter.replace('_', ' ')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-muted-foreground">Age Group</p>
                  <p className="text-accent font-semibold">{state.ageGroup} years</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-muted-foreground">Questions Asked</p>
                  <p className="text-accent font-semibold">{state.tutorQuestions.length} questions</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat content */}
      <div className="space-y-6 min-h-[400px] max-h-[600px] overflow-y-auto pr-2 pb-6 scrollbar-thin">
        {state.tutorAnswers.map((answer, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {/* User question (if exists) */}
            {state.tutorQuestions[index] && (
              <div className="flex justify-end mb-4">
                <div className="max-w-md bg-gradient-to-r from-blue-500 to-green-600 text-white p-4 rounded-2xl rounded-br-sm shadow-sm">
                  <div className="flex items-start space-x-2">
                    <MessageCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                    <p className="text-sm font-medium">{state.tutorQuestions[index]}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tutor answer */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-[2rem] shadow-sm border border-white">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-400 to-green-500 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading font-bold text-foreground/80 flex items-center">
                      Your Tutor
                      {state.currentSubject && (
                        <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
                          {getSubjectName(state.currentSubject)}
                        </span>
                      )}
                    </h3>
                    <span className="text-xs text-muted-foreground">Answer {index + 1}</span>
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {answer}
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Loading state */}
        {state.isGenerating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex justify-center"
          >
            <div className="w-full max-w-md">
              <TutorThinkingLoader />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />

        {/* Extra spacing to prevent overlap with input */}
        <div className="h-32" />
      </div>

      {/* Follow-up suggestions */}
      {state.followUpSuggestions.length > 0 && !state.isGenerating && canAsk && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-[2rem] shadow-sm border border-white">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-400 mr-2">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-bold text-foreground/80">Follow-up Questions</h3>
              <span className="text-xs text-muted-foreground ml-2">(Click to ask)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {state.followUpSuggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={state.isGenerating}
                  className={`
                    p-3 rounded-xl border-2 transition-all duration-200 text-left
                    ${state.isGenerating
                      ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 hover:border-yellow-300 text-gray-700'
                    }
                  `}
                  whileHover={!state.isGenerating ? { scale: 1.02 } : {}}
                  whileTap={!state.isGenerating ? { scale: 0.98 } : {}}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <p className="text-sm font-medium">{suggestion}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Input area */}
      {canAsk && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-0 bg-background/90 backdrop-blur-sm border-t border-slate-100 pt-4"
        >
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-[2rem] shadow-sm border border-white">
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-foreground/80 flex items-center">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-400 mr-2">
                  <MessageCircle className="w-4 h-4" />
                </div>
                Ask me anything!
              </h3>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <MagicalInput
                    placeholder={state.isGenerating
                      ? "I'm thinking about your question..."
                      : "What would you like to learn about? (e.g., 'How do rainbows form?')"
                    }
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    error={inputError}
                    disabled={state.isGenerating}
                  />
                </div>
                <Button
                  onClick={handleAskQuestion}
                  disabled={!userQuestion.trim() || state.isGenerating}
                  size="lg"
                  className="bg-accent hover:bg-accent/90"
                >
                  {state.isGenerating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {state.isGenerating ? 'Thinking...' : 'Ask'}
                </Button>
                <Button
                  onClick={handleMicClick}
                  variant="secondary"
                  size="lg"
                  className={isRecording ? 'bg-red-50 hover:bg-red-100' : ''}
                >
                  {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                  {isRecording ? 'Stop' : 'Record'}
                </Button>
              </div>

              {/* Quick question examples */}
              {!state.isGenerating && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground mr-2">Quick examples:</span>
                  {[
                    "How do plants grow?",
                    "What is 10 ÷ 2?",
                    "Why do we sleep?",
                    "How do I write a story?",
                    "What makes music?"
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setUserQuestion(example)}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full transition-colors duration-200 border border-blue-200"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Error display */}
      {state.error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-2 border-red-200 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <span className="text-red-800 font-medium">Oops!</span>
            </div>
            <p className="text-red-700 text-sm">{state.error}</p>
          </div>
        </motion.div>
      )}

      {/* Learning progress summary */}
      {state.tutorQuestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-green-50 rounded-[2rem] p-6 border-2 border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-foreground/80">Learning Progress</h3>
                <p className="text-sm text-muted-foreground">
                  You've asked {state.tutorQuestions.length} question{state.tutorQuestions.length !== 1 ? 's' : ''} today!
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Keep exploring and learning! 🌟</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
