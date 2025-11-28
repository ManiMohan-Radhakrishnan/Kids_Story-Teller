import { motion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";

interface MagicLoaderProps {
  text?: string;
}

export function MagicLoader({ text = "Making Magic Happen..." }: MagicLoaderProps) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md rounded-[2rem]">
      <div className="relative">
        {/* Rotating Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 rounded-full border-4 border-dashed border-primary/30"
        />

        {/* Bouncing Center */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
          </div>
        </motion.div>

        {/* Orbiting Stars */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          </div>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 text-xl font-heading font-bold text-foreground/80 tracking-wide"
      >
        {text}
      </motion.p>

      <div className="flex gap-2 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
            className={`w-3 h-3 rounded-full ${
              i === 0 ? "bg-primary" : i === 1 ? "bg-secondary" : "bg-accent"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
