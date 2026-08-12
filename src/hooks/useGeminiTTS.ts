import { useState, useRef, useEffect } from 'react';

export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export function useGeminiTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const preloadedBufferRef = useRef<AudioBuffer | null>(null);
  const preloadedTextRef = useRef<string>('');
  const preloadedVoiceRef = useRef<VoiceName | null>(null);

  const stop = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
        if ((sourceRef.current as any).disconnect) {
          (sourceRef.current as any).disconnect();
        }
      } catch (e) {
        // ignore
      }
      sourceRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
  };

  const fetchAndDecode = async (text: string, voiceName: VoiceName) => {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceName })
    });

    if (!response.ok) {
      throw new Error("TTS failed");
    }

    const { audio: base64Audio } = await response.json();

    // Decode base64 PCM 16-bit little-endian to Float32
    const binary = atob(base64Audio);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }

    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
    const audioCtx = audioCtxRef.current;
    const audioBuffer = audioCtx.createBuffer(1, float32.length, 24000);
    audioBuffer.copyToChannel(float32, 0);

    return { audioBuffer, audioCtx };
  };

  const preloadTTS = async (text: string, voiceName: VoiceName) => {
    if (preloadedTextRef.current === text && preloadedVoiceRef.current === voiceName && preloadedBufferRef.current) {
      return; // Already preloaded
    }
    
    setIsPreloading(true);
    try {
      const { audioBuffer } = await fetchAndDecode(text, voiceName);
      preloadedBufferRef.current = audioBuffer;
      preloadedTextRef.current = text;
      preloadedVoiceRef.current = voiceName;
    } catch (e) {
      console.error("Failed to preload TTS", e);
    } finally {
      setIsPreloading(false);
    }
  };

  const playTTS = async (text: string, voiceName: VoiceName, pace: number = 1.0, volume: number = 1.0, onWordIndexUpdate: (index: number) => void, onEnd: () => void) => {
    stop();
    setIsLoading(true);
    try {
      let audioBuffer: AudioBuffer;
      let audioCtx: AudioContext;

      if (preloadedBufferRef.current && preloadedTextRef.current === text && preloadedVoiceRef.current === voiceName) {
        audioBuffer = preloadedBufferRef.current;
        audioCtx = audioCtxRef.current!;
      } else {
        const result = await fetchAndDecode(text, voiceName);
        audioBuffer = result.audioBuffer;
        audioCtx = result.audioCtx;
      }

      setIsLoading(false);
      setIsPlaying(true);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = pace;
      
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      sourceRef.current = source;
      
      const duration = audioBuffer.duration;
      const words = text.split(/\s+/);
      
      // Better heuristic: weight words by length and punctuation
      const wordTimings: { startTime: number, index: number }[] = [];
      let totalWeight = 0;
      
      const weights = words.map(word => {
        let weight = Math.max(2, word.replace(/[^a-zA-Z0-9]/g, '').length);
        let pauseAfter = 0;
        
        if (word.endsWith(',')) pauseAfter = 4;
        else if (word.match(/[.;!?]$/)) pauseAfter = 8;
        
        const totalWordWeight = weight + pauseAfter;
        totalWeight += totalWordWeight;
        return { weight, pauseAfter, totalWordWeight };
      });
      
      const timePerWeight = duration / totalWeight;
      let currentTime = 0;
      
      for (let i = 0; i < words.length; i++) {
        wordTimings.push({ startTime: currentTime, index: i });
        currentTime += weights[i].totalWordWeight * timePerWeight;
      }

      let animationFrameId: number;
      const startTime = audioCtx.currentTime;
      let lastReportedIndex = -1;

      const updateSync = () => {
        if (!sourceRef.current) return;
        const elapsed = (audioCtx.currentTime - startTime) * pace;
        
        // Find the current word based on elapsed time
        let currentIdx = -1;
        for (let i = 0; i < wordTimings.length; i++) {
          if (elapsed >= wordTimings[i].startTime) {
            currentIdx = wordTimings[i].index;
          } else {
            break;
          }
        }
        
        if (currentIdx !== -1 && currentIdx !== lastReportedIndex) {
          lastReportedIndex = currentIdx;
          onWordIndexUpdate(currentIdx);
        }
        
        animationFrameId = requestAnimationFrame(updateSync);
      };

      source.onended = () => {
        cancelAnimationFrame(animationFrameId);
        onEnd();
        setIsPlaying(false);
      };

      source.start();
      animationFrameId = requestAnimationFrame(updateSync);
      
    } catch (err) {
      console.error("Gemini TTS failed, falling back to browser voice:", err);
      setIsLoading(false);
      
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        setIsPlaying(true);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85; // Roughly match the visual word reveal speed
        
        let wordCount = 0;
        utterance.onboundary = (e) => {
          if (e.name === 'word') {
            onWordIndexUpdate(wordCount);
            wordCount++;
          }
        };
        
        utterance.onend = () => {
          onEnd();
          setIsPlaying(false);
        };
        
        utterance.onerror = () => {
          onEnd();
          setIsPlaying(false);
        };
        
        // We need a way to stop it, so we hack `sourceRef.current.stop`
        sourceRef.current = {
          stop: () => window.speechSynthesis.cancel(),
          disconnect: () => {}
        } as any;
        
        window.speechSynthesis.speak(utterance);
      } else {
        onEnd();
      }
    }
  };

  useEffect(() => {
    return () => {
      stop();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return { playTTS, preloadTTS, stop, isPlaying, isLoading, isPreloading };
}
