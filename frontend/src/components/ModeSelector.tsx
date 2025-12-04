"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap } from "lucide-react";
import { useStory } from "@/contexts/StoryContext";
import { SessionMode } from "@/types/story";

export function ModeSelector() {
  const { state, setMode, hasActiveSession, resetSession } = useStory();

  const handleModeChange = async (newMode: SessionMode) => {
    if (hasActiveSession && state.mode !== newMode) {
      // If there's an active session and switching modes, reset the session
      resetSession();
    }
    setMode(newMode);
  };

  const modes = [
    {
      id: "story" as SessionMode,
      name: "Story Mode",
      icon: BookOpen,
      description: "Create engaging stories and adventures",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      borderColor: "border-purple-300",
    },
    {
      id: "tutor" as SessionMode,
      name: "Tutor Mode",
      icon: GraduationCap,
      description: "Ask questions and learn about any topic",
      gradient: "from-blue-500 to-green-500",
      bgGradient: "from-blue-50 to-green-50",
      borderColor: "border-blue-300",
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {hasActiveSession && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl"
        >
          <div className="flex items-center justify-center">
            <span className="text-yellow-600 text-sm font-medium">
              Note: Switching modes will end your current session. Your progress
              will be lost.
            </span>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modes.map((mode, index) => {
          const isActive = state.mode === mode.id;
          const Icon = mode.icon;

          return (
            <motion.button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-300
                ${
                  isActive
                    ? `bg-gradient-to-br ${mode.bgGradient} ${mode.borderColor} ring-4 ring-opacity-30 ring-purple-300`
                    : "bg-white border-gray-200 hover:border-gray-300"
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Selection indicator */}
              {isActive && (
                <motion.div
                  className="absolute top-3 right-3"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </motion.div>
              )}

              {/* Icon and content */}
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Professional icon */}
                <div
                  className={`
                  w-16 h-16 rounded-full flex items-center justify-center
                  ${
                    isActive
                      ? `bg-gradient-to-r ${mode.gradient} shadow-lg`
                      : "bg-gray-100"
                  }
                `}
                >
                  <Icon
                    className={`w-8 h-8 ${
                      isActive ? "text-white" : "text-gray-600"
                    }`}
                  />
                </div>

                {/* Mode name */}
                <h3
                  className={`
                  text-xl font-bold
                  ${
                    isActive
                      ? `bg-gradient-to-r ${mode.gradient} bg-clip-text text-transparent`
                      : "text-gray-700"
                  }
                `}
                >
                  {mode.name}
                </h3>

                {/* Description */}
                <p
                  className={`
                  text-sm leading-relaxed
                  ${isActive ? "text-gray-700" : "text-gray-500"}
                `}
                >
                  {mode.description}
                </p>

                {/* Features list */}
                <div className="space-y-1">
                  {mode.id === "story" ? (
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>• Interactive storytelling</div>
                      <div>• Character creation</div>
                      <div>• Age-appropriate content</div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>• Ask any question</div>
                      <div>• Learn about science, math & more</div>
                      <div>• Get follow-up suggestions</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Active session indicator */}
              {isActive && hasActiveSession && (
                <motion.div
                  className="absolute bottom-3 left-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center space-x-1 text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Active Session</span>
                  </div>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Mode comparison */}
      <motion.div
        className="mt-8 p-6 bg-gray-50 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">
          What&apos;s the difference?
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h5 className="font-semibold text-purple-700 flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              Story Mode
            </h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Create personalized stories</li>
              <li>• Continue adventures with your input</li>
              <li>• Character names and themes</li>
              <li>• Perfect for bedtime stories</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-blue-700 flex items-center">
              <GraduationCap className="w-4 h-4 mr-2" />
              Tutor Mode
            </h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Ask questions about any topic</li>
              <li>• Get age-appropriate explanations</li>
              <li>• Subject-specific help</li>
              <li>• Perfect for homework help</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
