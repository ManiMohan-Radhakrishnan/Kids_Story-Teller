'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';

export default function StoryLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8"
      >
        {/* Animated Book Icon with Glow */}
        <div className="relative mx-auto">
          <motion.div
            className="w-32 h-32 mx-auto"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-3xl opacity-30"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />

            {/* Icon container */}
            <div className="relative w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <motion.div
                animate={{
                  rotateY: [0, 180, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <BookOpen className="w-16 h-16 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Floating Sparkles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [0, Math.cos(i * 60 * Math.PI / 180) * 80],
                  y: [0, Math.sin(i * 60 * Math.PI / 180) * 80],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
              >
                <Sparkles className="w-5 h-5 text-primary" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h2 className="text-3xl font-heading font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Story Mode
          </h2>
          <motion.p
            className="text-muted-foreground text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Preparing your magical adventure...
          </motion.p>
        </motion.div>

        {/* Animated Progress Dots */}
        <div className="flex items-center justify-center space-x-3">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
