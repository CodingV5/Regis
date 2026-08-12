import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

type Emotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised';

interface ActorProps {
  activeWord: string;
  wordIndex: number;
  isSpeaking: boolean;
}

export default function Actor({ activeWord, wordIndex, isSpeaking }: ActorProps) {
  const [emotion, setEmotion] = useState<Emotion>('neutral');

  useEffect(() => {
    if (!activeWord) {
      setEmotion('neutral');
      return;
    }
    
    const word = activeWord.toLowerCase().replace(/[^a-z]/g, '');
    if (['joy', 'smile', 'laugh', 'happy', 'bright', 'love', 'hope', 'sun', 'warm'].includes(word)) {
      setEmotion('happy');
    } else if (['tear', 'cry', 'loss', 'sad', 'dark', 'grief', 'pain', 'fade', 'dust', 'death'].includes(word)) {
      setEmotion('sad');
    } else if (['rage', 'shatter', 'anger', 'fury', 'break', 'hate', 'storm', 'fire'].includes(word)) {
      setEmotion('angry');
    } else if (['shock', 'gasp', 'wow', 'sudden', 'startle', 'awe', 'wide'].includes(word)) {
      setEmotion('surprised');
    } else {
      setEmotion('neutral');
    }
  }, [activeWord]);

  // Animated Eyebrows
  const leftEyebrow = {
    neutral: "M30,32 Q39,30 48,32",
    happy: "M30,35 Q39,25 48,35",
    sad: "M30,30 Q39,25 48,38",
    angry: "M30,38 Q39,35 48,30",
    surprised: "M30,25 Q39,20 48,25"
  };

  const rightEyebrow = {
    neutral: "M72,32 Q81,30 90,32",
    happy: "M72,35 Q81,25 90,35",
    sad: "M72,38 Q81,25 90,30",
    angry: "M72,30 Q81,35 90,38",
    surprised: "M72,25 Q81,20 90,25"
  };

  const [mouthPhase, setMouthPhase] = useState<'closed' | 'open'>('closed');

  useEffect(() => {
    if (isSpeaking && activeWord) {
      setMouthPhase('open');
      const syllableCount = Math.max(1, Math.floor(activeWord.length / 3));
      let flapCount = 0;
      
      const interval = setInterval(() => {
        setMouthPhase(prev => prev === 'open' ? 'closed' : 'open');
        flapCount++;
        // We do syllableCount * 2 transitions (open -> closed -> open...)
        // But we want to end on closed. 
        if (flapCount >= syllableCount * 2 - 1) {
          clearInterval(interval);
          setTimeout(() => setMouthPhase('closed'), 100);
        }
      }, 120);

      return () => {
        clearInterval(interval);
        setMouthPhase('closed');
      };
    } else {
      setMouthPhase('closed');
    }
  }, [activeWord, wordIndex, isSpeaking]);

  // Morphing Mouth Paths (using strict 2-curve Beziers for smooth Framer Motion interpolation)
  const closedMouths = {
    neutral: "M45,75 Q60,75 75,75 Q60,75 45,75",
    happy: "M40,70 Q60,85 80,70 Q60,85 40,70",
    sad: "M45,80 Q60,70 75,80 Q60,70 45,80",
    angry: "M45,75 Q60,70 75,75 Q60,70 45,75",
    surprised: "M55,75 Q60,72 65,75 Q60,78 55,75"
  };

  const openMouths = {
    neutral: "M45,75 Q60,85 75,75 Q60,65 45,75",
    happy: "M40,70 Q60,95 80,70 Q60,65 40,70",
    sad: "M45,80 Q60,90 75,80 Q60,65 45,80",
    angry: "M40,75 Q60,90 80,75 Q60,65 40,75",
    surprised: "M55,75 Q60,90 65,75 Q60,60 55,75"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: [0, -15, 0], // Floating motion
      }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ 
        y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 }
      }}
      className="fixed bottom-6 right-6 md:bottom-12 md:right-12 z-50 flex flex-col items-center justify-center pointer-events-none"
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{
          rotateX: [0, 8, -4, 0],
          rotateY: [0, -10, 8, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut"
        }}
        className="relative w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center bg-[var(--sidebar-bg)] border border-[var(--border-color)] shadow-2xl"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 4px 6px -1px rgba(255, 255, 255, 0.1), inset 0 -10px 15px -3px rgba(0, 0, 0, 0.1)',
          transformStyle: 'preserve-3d'
        }}
      >
        <svg 
          viewBox="0 0 120 120" 
          className="absolute w-full h-full text-[var(--text-color)] drop-shadow-md"
          style={{ transform: 'translateZ(30px)' }} // Push face forward in 3D space
        >
          {/* Eyebrows */}
          <motion.path 
            d={leftEyebrow[emotion]} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round"
            animate={{ d: leftEyebrow[emotion] }}
            transition={{ duration: 0.3 }}
          />
          <motion.path 
            d={rightEyebrow[emotion]} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round"
            animate={{ d: rightEyebrow[emotion] }}
            transition={{ duration: 0.3 }}
          />

          {/* Eyes with Blinking Animation */}
          <motion.g
            animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              times: [0, 0.9, 0.95, 0.98, 1], // Quick blink at the end of every 4 seconds
              ease: "easeInOut" 
            }}
            style={{ transformOrigin: '60px 45px' }}
          >
            {/* Left Eye */}
            <circle cx="40" cy="45" r="7" fill="currentColor" />
            <circle cx="38" cy="43" r="2" fill="var(--bg-color)" /> {/* Pupil glint */}
            
            {/* Right Eye */}
            <circle cx="80" cy="45" r="7" fill="currentColor" />
            <circle cx="78" cy="43" r="2" fill="var(--bg-color)" /> {/* Pupil glint */}
          </motion.g>

          {/* Nose (Subtle) */}
          <path d="M60,45 Q65,60 60,65" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />

          {/* Morphing Mouth */}
          <motion.path
            d={closedMouths[emotion]}
            fill={mouthPhase === 'open' ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={mouthPhase === 'open' ? "0" : "2"}
            strokeLinecap="round"
            animate={{ 
              d: mouthPhase === 'open' ? openMouths[emotion] : closedMouths[emotion]
            }}
            transition={{ 
              duration: 0.1, 
              ease: "easeInOut"
            }}
          />
        </svg>
      </motion.div>
      
      <motion.div 
        className="mt-4 font-sans text-[10px] tracking-[0.3em] uppercase text-[var(--text-muted)] bg-[var(--bg-color)] px-3 py-1 rounded-full border border-[var(--border-color)] shadow-sm"
        style={{ transform: 'translateZ(10px)' }}
      >
        {isSpeaking ? (
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            Performing
          </motion.span>
        ) : "The Actor"}
      </motion.div>
    </motion.div>
  );
}
