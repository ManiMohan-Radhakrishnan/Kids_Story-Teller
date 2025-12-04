"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  User,
  Settings,
  Wand2,
  Feather,
  Loader2,
} from "lucide-react";
import { useStory } from "@/contexts/StoryContext";
import { Button } from "@/components/ui/Button";
import { MagicalTextArea, MagicalInput } from "@/components/ui/Input";
import { MagicalSelect } from "@/components/ui/Select";
import { StoryGeneratingLoader } from "@/components/ui/LoadingSpinner";

export function StoryCreator() {
  const { state, setConfig, startStory, loadFilters, clearError } = useStory();

  const [prompt, setPrompt] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [promptError, setPromptError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load filters on component mount
  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  const handleStartStory = async () => {
    // Validate prompt
    setIsLoading(true);
    if (!prompt.trim()) {
      setPromptError("Please tell us what kind of story you'd like to hear!");
      return;
    }

    if (prompt.trim().length < 10) {
      setPromptError("Please give us a bit more detail about your story idea!");
      return;
    }

    setPromptError("");
    clearError();

    // Update config with character name
    if (characterName.trim()) {
      setConfig({ characterName: characterName.trim() });
    }

    await startStory(prompt.trim());
    setIsLoading(false);
  };

  const filterOptions = [
    {
      value: "educational",
      label: "Educational Stories",
      emoji: "",
      description: "Learn while having fun with educational content",
    },
    {
      value: "moral_values",
      label: "Value-Based Stories",
      emoji: "",
      description: "Stories that teach positive values and character",
    },
    {
      value: "fun_only",
      label: "Entertainment Stories",
      emoji: "",
      description: "Engaging adventures focused on entertainment",
    },
  ];

  const ageOptions = [
    {
      value: "3-5",
      label: "Ages 3-5 years",
      emoji: "",
      description: "Simple vocabulary and basic concepts",
    },
    {
      value: "6-8",
      label: "Ages 6-8 years",
      emoji: "",
      description: "Engaging stories with educational elements",
    },
    {
      value: "9-12",
      label: "Ages 9-12 years",
      emoji: "",
      description: "Complex narratives with deeper themes",
    },
  ];

  const lengthOptions = [
    {
      value: "short",
      label: "Short Story",
      emoji: "",
      description: "Perfect for a quick story session",
    },
    {
      value: "medium",
      label: "Medium Story",
      emoji: "",
      description: "Balanced length for storytelling",
    },
    {
      value: "long",
      label: "Long Story",
      emoji: "",
      description: "Extended narrative for deeper engagement",
    },
  ];

  if (isLoading || state.isGenerating) {
    return (
      <div className="max-w-2xl mx-auto">
        <StoryGeneratingLoader />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10 space-y-3">
        <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-sm mb-2">
          <Feather className="w-8 h-8 text-primary/60" />
        </div>
        <h1 className="text-5xl font-heading font-bold text-foreground/90">
          Story Weaver
        </h1>
        <p className="text-muted-foreground text-xl font-medium">
          Softly spin a tale of wonder...
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleStartStory();
            }}
            className="space-y-6"
          >
            <div className="bg-white/70 backdrop-blur-sm p-8 rounded-[2rem] space-y-8 shadow-sm border border-white">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-2xl font-heading font-bold text-foreground/80">
                  <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  What shall we write?
                </div>

                <MagicalTextArea
                  placeholder="Once upon a time, in a land far away..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  error={promptError}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-2xl font-heading font-bold text-foreground/80">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-400">
                    <User className="w-5 h-5" />
                  </div>
                  Who is the friend?
                </div>

                <MagicalInput
                  placeholder="Name your character..."
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              size="xl"
              disabled={!prompt.trim() || state.isGenerating || isLoading}
              className="w-full shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:bg-primary/90 transition-all transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <Loader2 className="mr-2 w-6 h-6 animate-spin" />
              ) : (
                <Wand2 className="mr-2 w-6 h-6" />
              )}
              {isLoading ? "Weaving Your Story..." : "Weave My Story"}
            </Button>
          </form>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-4 space-y-6"
        >
          {/* Settings Panel */}
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-[2rem] space-y-6 shadow-sm border border-white">
            <h3 className="font-heading font-bold text-lg text-foreground/60 uppercase tracking-wider text-center">
              Settings
            </h3>

            <MagicalSelect
              label="Story Type"
              value={state.contentFilter}
              onChange={(value) =>
                setConfig({
                  contentFilter: value as
                    | "moral_values"
                    | "educational"
                    | "fun_only",
                })
              }
              options={filterOptions}
            />

            <MagicalSelect
              label="Age Group"
              value={state.ageGroup}
              onChange={(value) =>
                setConfig({ ageGroup: value as "3-5" | "6-8" | "9-12" })
              }
              options={ageOptions}
            />

            <MagicalSelect
              label="Story Length"
              value={state.storyLength}
              onChange={(value) =>
                setConfig({ storyLength: value as "short" | "medium" | "long" })
              }
              options={lengthOptions}
            />
          </div>

          {/* Fun fact about current settings */}
          <motion.div
            className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-[2rem] border border-yellow-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-gray-700">
              <span className="font-semibold">💡 Did you know?</span> We'll
              create a{" "}
              <span className="font-medium text-purple-700">
                {lengthOptions
                  .find((l) => l.value === state.storyLength)
                  ?.label.toLowerCase()}
              </span>{" "}
              perfect for{" "}
              <span className="font-medium text-purple-700">
                {ageOptions
                  .find((a) => a.value === state.ageGroup)
                  ?.label.toLowerCase()}
              </span>{" "}
              with a{" "}
              <span className="font-medium text-purple-700">
                {filterOptions
                  .find((f) => f.value === state.contentFilter)
                  ?.label.toLowerCase()}
              </span>{" "}
              theme!
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Error Display */}
      {state.error && (
        <motion.div
          className="max-w-4xl mx-auto mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">⚠️</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Oops! Something went wrong
                </h3>
                <div className="mt-2 text-sm text-red-700">{state.error}</div>
              </div>
              <div className="ml-auto">
                <Button onClick={clearError} size="sm" variant="secondary">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Fun examples */}
      <motion.div
        className="max-w-6xl mx-auto mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Need Some Ideas?
          </h3>
          <p className="text-gray-600">
            Here are some fun story ideas to get you started!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            "A magical library where books come to life",
            "A friendly monster who loves to garden",
            "A space adventure with talking planets",
            "An underwater city made of coral and pearls",
            "A time-traveling treehouse",
            "A superhero who saves the day with kindness",
          ].map((idea, index) => (
            <motion.button
              key={index}
              className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all duration-200 text-left"
              onClick={() => setPrompt(idea)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <p className="text-sm font-medium text-gray-700">{idea}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
