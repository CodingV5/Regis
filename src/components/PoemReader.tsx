import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, Play, Square, Share2, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Poem } from '../types';

interface PoemReaderProps {
  poemId: string;
  onNavigate: (view: string) => void;
  poems: Poem[];
  favorites: string[];
  toggleFavorite: (poemId: string) => void;
  onToggleDarkMode: () => void;
}

const SHIVER_WORDS = ['cold', 'shiver', 'shivers', 'shivering', 'winter', 'ice', 'freeze', 'frozen', 'snow', 'chill', 'shivering'];
const SHATTER_WORDS = ['angry', 'shatter', 'shatters', 'shattered', 'shattering', 'rage', 'break', 'broken', 'fury', 'wrath', 'mad', 'shatter'];

const getWordType = (word: string) => {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
  if (SHIVER_WORDS.includes(cleanWord)) return 'shiver';
  if (SHATTER_WORDS.includes(cleanWord)) return 'shatter';
  return 'normal';
};

const kineticVariants = {
  hidden: { opacity: 0, y: 15, filter: 'blur(8px)' },
  normal: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: i * 0.35, duration: 0.8, ease: "easeOut" }
  }),
  shiver: (i: number) => ({
    opacity: 1,
    y: 0,
    x: [0, -2, 2, -1, 1, 0, -2, 2, 0],
    filter: 'blur(0px)',
    transition: { 
      delay: i * 0.35, 
      duration: 0.8, 
      ease: "easeOut",
      x: { delay: i * 0.35 + 0.4, duration: 1.5, repeat: Infinity, repeatType: "mirror", ease: "linear" }
    }
  }),
  shatter: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: [1, 1.25, 0.9, 1.05, 1],
    rotate: [0, -8, 8, -4, 0],
    filter: 'blur(0px)',
    color: ['var(--text-color)', '#ef4444', 'var(--text-color)'],
    transition: { 
      delay: i * 0.35, 
      duration: 0.8, 
      ease: "easeOut",
      scale: { delay: i * 0.35 + 0.1, duration: 0.5 },
      rotate: { delay: i * 0.35 + 0.1, duration: 0.5 },
      color: { delay: i * 0.35 + 0.1, duration: 0.8 }
    }
  })
};

export default function PoemReader({ poemId, onNavigate, poems, favorites, toggleFavorite, onToggleDarkMode }: PoemReaderProps) {
  const currentIndex = poems.findIndex(p => p.id === poemId);
  const poem = poems[currentIndex];
  
  const [isKinetic, setIsKinetic] = useState(false);
  const [playKey, setPlayKey] = useState(0);
  const [copied, setCopied] = useState(false);

  // Scroll to top when poem changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsKinetic(false); // Reset kinetic mode on poem change
    setCopied(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [poemId]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

  const toggleKinetic = () => {
    if (isKinetic) {
      setIsKinetic(false);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      setIsKinetic(true);
      setPlayKey(prev => prev + 1);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        // Delay speaking slightly to match the visual transition
        setTimeout(() => {
          const textToSpeak = poem.stanzas.join('. ');
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.rate = 0.85; // Roughly match the visual word reveal speed
          window.speechSynthesis.speak(utterance);
        }, 100);
      }
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: poem.title,
      text: `Read "${poem.title}" by Aidoo Noble Abeiku Amos`,
      url: window.location.href,
    };
    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing', err);
    }
  };

  let wordIndex = 0;

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
          <h1 className="text-3xl md:text-4xl font-normal italic mb-3 leading-tight text-left pr-24">{poem.title}</h1>
          <div className="absolute top-2 right-0 flex gap-2">
            <button
              onClick={handleShare}
              className={`p-2 focus:outline-none transition-colors text-[var(--border-color)] hover:text-[var(--text-color)]`}
              aria-label="Share poem"
            >
              {copied ? <Check size={20} className="text-green-500" /> : <Share2 size={20} fill="currentColor" />}
            </button>
            <button
              onClick={toggleKinetic}
              className={`p-2 focus:outline-none transition-colors ${isKinetic ? 'text-green-600 dark:text-green-400' : 'text-[var(--border-color)] hover:text-[var(--text-muted)]'}`}
              aria-label={isKinetic ? "Stop Kinetic Typography" : "Play Kinetic Typography"}
            >
              {isKinetic ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <button
              onClick={() => toggleFavorite(poem.id)}
              className={`p-2 focus:outline-none transition-colors ${favorites.includes(poem.id) ? 'text-yellow-500' : 'text-[var(--border-color)] hover:text-[var(--text-muted)]'}`}
              aria-label={favorites.includes(poem.id) ? "Remove from favorites" : "Add to favorites"}
            >
              <Star size={24} fill={favorites.includes(poem.id) ? "currentColor" : "none"} />
            </button>
          </div>
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
        <div className="flex flex-col items-start w-full min-h-[300px]">
          <div className="w-full text-left font-serif text-[18px] md:text-[20px] leading-[1.75] text-[var(--text-color)] selection:bg-[var(--text-muted)] selection:text-[var(--bg-color)]">
            <AnimatePresence mode="wait">
              {isKinetic ? (
                <motion.div
                  key={`kinetic-${playKey}`}
                  className="w-full"
                >
                  {poem.stanzas.map((stanza, sIndex) => (
                    <div key={sIndex} className="mb-8">
                      {stanza.split('\n').map((line, lIndex) => {
                        const words = line.split(' ');
                        return (
                          <div key={lIndex} className="min-h-[1.75em] flex flex-wrap gap-[0.25em]">
                            {words.map((word, wIndex) => {
                              const currentGlobalIndex = wordIndex++;
                              const type = getWordType(word);
                              return (
                                <motion.span
                                  key={wIndex}
                                  custom={currentGlobalIndex}
                                  variants={kineticVariants}
                                  initial="hidden"
                                  animate={type}
                                  className="inline-block"
                                >
                                  {word || '\u00A0'}
                                </motion.span>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="static"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {poem.stanzas.map((stanza, index) => (
                    <p key={index} className="mb-8 whitespace-pre-wrap">
                      {stanza}
                    </p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
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
