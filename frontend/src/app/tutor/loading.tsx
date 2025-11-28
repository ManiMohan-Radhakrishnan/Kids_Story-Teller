'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Sparkles } from 'lucide-react';

export default function TutorLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8"
      >
        {/* Animated Graduation Cap with Glow */}
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
              className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-500 rounded-full blur-3xl opacity-30"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />

            {/* Icon container */}
            <div className="relative w-full h-full bg-gradient-to-br from-blue-400 to-green-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [-5, 5, -5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <GraduationCap className="w-16 h-16 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Floating Knowledge Sparkles */}
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
                <Sparkles className="w-5 h-5 text-accent" />
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
          <h2 className="text-3xl font-heading font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Tutor Mode
          </h2>
          <motion.p
            className="text-muted-foreground text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Getting ready to help you learn...
          </motion.p>
        </motion.div>

        {/* Animated Progress Dots */}
        <div className="flex items-center justify-center space-x-3">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
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
