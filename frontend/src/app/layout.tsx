import type { Metadata } from 'next';
import { Outfit, Fredoka } from 'next/font/google';
import './globals.css';
import { StoryProvider } from '@/contexts/StoryContext';
import { Navigation } from '@/components/Navigation';

// Outfit font for body text
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// Fredoka font for headings
const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kids Learning Bot - Stories & Tutoring with AI',
  description: 'Create personalized stories and get educational help for children with AI. Safe storytelling, interactive tutoring, and age-appropriate learning experiences.',
  keywords: ['kids stories', 'children stories', 'AI tutoring', 'educational AI', 'safe content', 'kids learning', 'homework help'],
  authors: [{ name: 'Kids Learning Bot Team' }],
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#8b5cf6',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${fredoka.variable}`}>
      <body className="min-h-screen w-full relative overflow-y-auto selection:bg-primary/10 selection:text-primary font-sans">
        <StoryProvider>
          {/* Background Image */}
          <div
            className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
            style={{
              backgroundImage: 'url(/background.png)',
              backgroundAttachment: 'fixed'
            }}
          />

          {/* Soft overlay for better text readability */}
          <div className="fixed inset-0 z-0 bg-white/40 backdrop-blur-[2px]" />

          {/* Navigation */}
          <Navigation />

          {/* Main content */}
          <div className="relative z-10">
            {children}
          </div>
        </StoryProvider>
      </body>
    </html>
  );
}