"use client";

import React from "react";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
  variant?: "default" | "magical" | "rainbow";
}

const sizes = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

export function LoadingSpinner({
  size = "md",
  message = "Creating your magical story...",
  variant = "magical",
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        {variant === "magical" && (
          <>
            {/* Outer ring */}
            <motion.div
              className={`${sizes[size]} border-4 border-purple-200 rounded-full`}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            {/* Inner spinning element */}
            <motion.div
              className={`absolute inset-2 bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 rounded-full`}
              animate={{
                rotate: -360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
              }}
            />
            {/* Center dot */}
            <div className="absolute inset-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          </>
        )}

        {variant === "rainbow" && (
          <div className="relative">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`absolute ${sizes[size]} border-4 rounded-full`}
                style={{
                  borderColor: ["#ef4444", "#f97316", "#eab308"][i],
                  borderTopColor: "transparent",
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.5 + i * 0.2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )}

        {variant === "default" && (
          <motion.div
            className={`${sizes[size]} border-4 border-blue-200 border-t-blue-500 rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      {message && (
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-lg font-medium text-gray-700 mb-2">{message}</p>
          <motion.div
            className="flex justify-center space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-purple-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export function StoryGeneratingLoader() {
  const messages = [
    "🌟 Weaving magical words...",
    "📚 Creating your adventure...",
    "🎨 Painting with imagination...",
    "✨ Sprinkling story magic...",
    "🦄 Bringing characters to life...",
  ];

  const [currentMessage, setCurrentMessage] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl">
      <motion.div
        className="relative w-20 h-20 mb-6"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        {/* Book icon animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg transform rotate-12" />
        <div className="absolute inset-1 bg-white rounded-lg" />
        <div className="absolute inset-3 space-y-1">
          <div className="h-1 bg-gray-300 rounded" />
          <div className="h-1 bg-gray-300 rounded w-3/4" />
          <div className="h-1 bg-gray-300 rounded w-1/2" />
        </div>

        {/* Floating sparkles */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 20}%`,
            }}
            animate={{
              y: [-10, -20, -10],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      <motion.p
        key={currentMessage}
        className="text-lg font-medium text-purple-700 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
      >
        {messages[currentMessage]}
      </motion.p>
    </div>
  );
}

export function TutorThinkingLoader() {
  const messages = [
    "Analyzing your question...",
    "Preparing educational content...",
    "Processing information...",
    "Finding the best explanation...",
    "Gathering helpful details...",
  ];

  const [currentMessage, setCurrentMessage] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl">
      <motion.div
        className="relative w-20 h-20 mb-6"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        {/* Professional graduation cap icon animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-500 rounded-full" />
        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
          <GraduationCap className="w-8 h-8 text-blue-600" />
        </div>

        {/* Floating question marks */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 text-blue-500 font-bold text-xs flex items-center justify-center"
            style={{
              left: `${15 + i * 25}%`,
              top: `${5 + i * 15}%`,
            }}
            animate={{
              y: [-8, -16, -8],
              opacity: [0, 1, 0],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          >
            ?
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        key={currentMessage}
        className="text-lg font-medium text-blue-700 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
      >
        {messages[currentMessage]}
      </motion.p>
    </div>
  );
}
