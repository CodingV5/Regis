import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useEffect } from 'react';
import { Poem } from '../types';

interface PoemReaderProps {
  poemId: string;
  onNavigate: (view: string) => void;
  poems: Poem[];
  favorites: string[];
  toggleFavorite: (poemId: string) => void;
  onToggleDarkMode: () => void;
}

export default function PoemReader({ poemId, onNavigate, poems, favorites, toggleFavorite, onToggleDarkMode }: PoemReaderProps) {
  const currentIndex = poems.findIndex(p => p.id === poemId);
  const poem = poems[currentIndex];

  // Scroll to top when poem changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [poemId]);

  if (!poem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="font-serif text-2xl mb-4">Poem not found</h2>
        <button onClick={() => onNavigate('home')} className="text-[var(--text-muted)] underline">
          Return Home
        </button>
      </div>
    );
  }

  const prevPoem = currentIndex > 0 ? poems[currentIndex - 1] : null;
  const nextPoem = currentIndex < poems.length - 1 ? poems[currentIndex + 1] : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === 'ArrowLeft' && prevPoem) {
        onNavigate(`poem-${prevPoem.id}`);
      } else if (e.key === 'ArrowRight' && nextPoem) {
        onNavigate(`poem-${nextPoem.id}`);
      } else if (e.key.toLowerCase() === 'd') {
        onToggleDarkMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevPoem, nextPoem, onNavigate, onToggleDarkMode]);

  return (
    <motion.div
      key={poemId} // Force re-animation when poem changes
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5 }}
      className="py-16 md:py-24 relative flex-1 w-full flex flex-col"
    >
      <article className="max-w-[600px] mx-auto px-6 w-full flex-col items-center relative z-10">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-sans font-bold text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors mb-10 -ml-2"
        >
          <ChevronLeft size={14} /> Back
        </button>
        <header className="mb-12 relative w-full">
          <h1 className="text-3xl md:text-4xl font-normal italic mb-3 leading-tight text-left pr-12">{poem.title}</h1>
          <button
            onClick={() => toggleFavorite(poem.id)}
            className={`absolute top-2 right-0 p-2 focus:outline-none transition-colors ${favorites.includes(poem.id) ? 'text-yellow-500' : 'text-[var(--border-color)] hover:text-[var(--text-muted)]'}`}
            aria-label={favorites.includes(poem.id) ? "Remove from favorites" : "Add to favorites"}
          >
            <Star size={24} fill={favorites.includes(poem.id) ? "currentColor" : "none"} />
          </button>
          <div className="flex flex-col gap-2">
            <span className="font-sans text-[10px] tracking-widest uppercase text-[var(--text-color)] font-semibold mt-2 mb-1">Aidoo Noble Abeiku Amos</span>
            <div className="flex items-center gap-3 text-[var(--text-muted)] font-sans text-[10px] md:text-[11px] tracking-widest uppercase">
              <span>Theme: {poem.category}</span>
              <span className="w-1 h-1 bg-[var(--text-muted)] rounded-full"></span>
              <span>2024</span>
            </div>
          </div>
        </header>

        {/* POEM DISPLAY RULES (CRITICAL): 
            - bounding box perfectly centered (max-w-[600px] mx-auto)
            - text strictly left-aligned 
            - Stanza separation with 2rem (mb-8) */}
        <div className="flex flex-col items-start w-full">
          <div className="w-full text-left font-serif text-[18px] md:text-[20px] leading-[1.75] text-[var(--text-color)] selection:bg-[var(--text-muted)] selection:text-[var(--bg-color)]">
            {poem.stanzas.map((stanza, index) => (
              <p key={index} className="mb-8 whitespace-pre-wrap">
                {stanza}
              </p>
            ))}
          </div>
        </div>
      </article>
      
      {/* Pagination Bottom Footer styled like design */}
      <footer className="mt-auto pt-20 h-24 px-8 md:px-12 flex items-center justify-between border-t border-[var(--border-light)] w-full max-w-[900px] mx-auto shrink-0 relative z-10">
        <div className="flex-1 flex justify-start">
          {prevPoem ? (
            <button
              onClick={() => onNavigate(`poem-${prevPoem.id}`)}
              className="group flex items-center gap-4 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors"
            >
              <div className="w-10 h-10 border border-[var(--border-color)] rounded-full flex items-center justify-center group-hover:border-[var(--text-color)] transition-colors">
                &larr;
              </div>
              <span className="font-sans text-xs tracking-widest uppercase font-bold hidden sm:inline">Previous</span>
            </button>
          ) : <div className="w-10"></div>}
        </div>
        
        <div className="font-sans text-[10px] tracking-[0.4em] text-[var(--text-muted)] uppercase opacity-60">
          {String(currentIndex + 1).padStart(2, '0')} / {String(poems.length).padStart(2, '0')}
        </div>
        
        <div className="flex-1 flex justify-end">
          {nextPoem ? (
            <button
              onClick={() => onNavigate(`poem-${nextPoem.id}`)}
              className="group flex items-center gap-4 text-[var(--text-color)] hover:text-[var(--text-muted)] transition-colors"
            >
              <span className="font-sans text-xs tracking-widest uppercase font-bold hidden sm:inline">Next</span>
              <div className="w-10 h-10 border border-[var(--text-color)] rounded-full flex items-center justify-center group-hover:border-[var(--text-muted)] transition-colors">
                &rarr;
              </div>
            </button>
          ) : <div className="w-10"></div>}
        </div>
      </footer>
    </motion.div>
  );
}
