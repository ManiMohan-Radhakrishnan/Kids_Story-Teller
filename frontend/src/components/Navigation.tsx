"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, GraduationCap } from "lucide-react";
import { useStory } from "@/contexts/StoryContext";

export function Navigation() {
  const { resetSession } = useStory();
  const pathname = usePathname();
  const router = useRouter();

  const handleNewStory = (path: string) => {
    resetSession();
    router.push(path);
  };

  return (
    <nav className="relative z-50 w-full px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
      {/* Logo */}
      <div
        onClick={() => handleNewStory("/")}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <Image
          src="/logo.png"
          alt="Logo"
          width={40}
          height={40}
          className="object-contain opacity-80 group-hover:opacity-100 transition-opacity"
        />
        <span className="text-2xl font-heading font-bold text-foreground/80 tracking-tight group-hover:text-foreground transition-colors">
          KidsOcta
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
          Safe & Educational
        </span>

        {/* Story Mode */}
        <button
          onClick={() => handleNewStory("/story")}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
            pathname === "/story"
              ? "bg-white text-primary shadow-sm ring-1 ring-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-white/50"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Story Mode
        </button>

        {/* Tutor Mode */}
        <button
          onClick={() => handleNewStory("/tutor")}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
            pathname === "/tutor"
              ? "bg-white text-accent shadow-sm ring-1 ring-accent/10"
              : "text-muted-foreground hover:text-foreground hover:bg-white/50"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Tutor Mode
        </button>
      </div>
    </nav>
  );
}
