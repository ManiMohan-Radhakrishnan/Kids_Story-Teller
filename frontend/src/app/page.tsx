'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, ArrowRight, Cloud, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", bounce: 0.4 }
  }
} as const;

export default function HomePage() {
  // Show mode selection home page
  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 border border-white text-sm font-bold text-primary/80 mb-4 shadow-sm"
            >
              <Cloud className="w-4 h-4 fill-primary/20" />
              <span className="tracking-wide uppercase text-xs">Soft & Safe Learning</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-7xl font-heading font-bold text-foreground leading-tight"
            >
              A gentle place to <br/>
              <span className="text-gradient">dream & learn</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed"
            >
              Calm, creative, and kind. Start your quiet adventure today.
            </motion.p>
          </div>

          {/* Mode Selection Cards */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          >
            {/* Story Mode Card */}
            <Link href="/story">
              <motion.div
                variants={item}
                whileHover={{ scale: 1.01, y: -5 }}
                whileTap={{ scale: 0.99 }}
                className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] cursor-pointer group relative overflow-hidden h-full border border-white shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-500"
              >
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500">
                  <BookOpen className="w-48 h-48 text-primary" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <BookOpen className="w-8 h-8 text-primary/60 fill-primary/10" />
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-3xl font-heading font-bold text-foreground/90">Story Time</h2>
                    <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                      Create gentle bedtime stories together.
                    </p>
                  </div>

                  <div className="mt-auto pt-4">
                    <span className="px-6 py-2.5 bg-white text-primary/80 rounded-full font-bold text-sm shadow-sm border border-primary/10 group-hover:border-primary/30 transition-all flex items-center gap-2">
                      Start Writing <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Tutor Mode Card */}
            <Link href="/tutor">
              <motion.div
                variants={item}
                whileHover={{ scale: 1.01, y: -5 }}
                whileTap={{ scale: 0.99 }}
                className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] cursor-pointer group relative overflow-hidden h-full border border-white shadow-sm hover:shadow-lg hover:shadow-accent/5 transition-all duration-500"
              >
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500">
                  <GraduationCap className="w-48 h-48 text-accent" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <GraduationCap className="w-8 h-8 text-accent/60 fill-accent/10" />
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-3xl font-heading font-bold text-foreground/90">Helpful Tutor</h2>
                    <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                      Friendly answers to all your questions.
                    </p>
                  </div>

                  <div className="mt-auto pt-4">
                    <span className="px-6 py-2.5 bg-white text-accent/80 rounded-full font-bold text-sm shadow-sm border border-accent/10 group-hover:border-accent/30 transition-all flex items-center gap-2">
                      Ask a Question <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Cloud, title: "Cloud Soft", desc: "Gentle interface.", color: "text-primary/60", bg: "bg-primary/5" },
                { icon: Heart, title: "Kind AI", desc: "Always friendly.", color: "text-pink-400", bg: "bg-pink-50" },
                { icon: Sparkles, title: "Magical", desc: "Spark creativity.", color: "text-accent/60", bg: "bg-accent/5" },
              ].map((feature, i) => (
                <div key={i} className="bg-white/40 p-6 rounded-3xl space-y-3 text-center transition-transform duration-300">
                  <div className={`w-12 h-12 mx-auto ${feature.bg} rounded-full flex items-center justify-center ${feature.color}`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading font-bold text-lg text-foreground/80">{feature.title}</h4>
                  <p className="text-muted-foreground text-sm font-medium">{feature.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
