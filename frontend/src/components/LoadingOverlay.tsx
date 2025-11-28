'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function LoadingOverlay({ isLoading, message = 'Creating magic...' }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="bg-white rounded-3xl shadow-2xl border-2 border-primary/20 p-8 max-w-sm mx-4"
          >
            <div className="flex flex-col items-center gap-4">
              {/* Animated Loader */}
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-16 h-16 text-primary" />
                </motion.div>

                {/* Sparkle Effect */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="w-6 h-6 text-accent fill-accent" />
                </motion.div>
              </div>

              {/* Loading Message */}
              <div className="text-center">
                <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                  {message}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we work our magic
                </p>
              </div>

              {/* Animated Dots */}
              <div className="flex gap-2">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                    className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-accent"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
