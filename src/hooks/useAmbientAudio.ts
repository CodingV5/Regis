import { useEffect, useRef, useState } from 'react';

type AudioTheme = 'rain' | 'ocean' | 'wind' | 'ethereal' | 'none';

export function useAmbientAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<AudioTheme>('none');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<any[]>([]);

  const stopAudio = () => {
    nodesRef.current.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // Ignore errors on cleanup
      }
    });
    nodesRef.current = [];
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  const createNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    // Create brown noise for a softer, more natural sound
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Compensate for gain
    }
    return buffer;
  };

  const playTheme = (theme: AudioTheme, volume: number = 1.0) => {
    stopAudio();
    if (theme === 'none') return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.5 * volume; // Overall volume
    masterGain.connect(ctx.destination);
    nodesRef.current.push(masterGain);

    if (theme === 'rain' || theme === 'ocean' || theme === 'wind') {
      const noiseBuffer = createNoiseBuffer(ctx);
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;
      noiseSrc.loop = true;

      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      noiseSrc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(masterGain);

      nodesRef.current.push(noiseSrc, filter, gainNode);

      if (theme === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        gainNode.gain.value = 0.8;
      } else if (theme === 'ocean') {
        filter.type = 'lowpass';
        filter.frequency.value = 600;
        
        // Modulate volume for waves
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // 10 seconds per wave
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.6; // Depth of modulation
        
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
        
        // Base gain
        gainNode.gain.value = 0.4;
        
        lfo.start();
        nodesRef.current.push(lfo, lfoGain);
      } else if (theme === 'wind') {
        filter.type = 'bandpass';
        filter.Q.value = 1.5;
        gainNode.gain.value = 1.5;

        // Modulate frequency for howling wind
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.2;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 400; // Sweep range
        
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        
        filter.frequency.value = 400; // Base frequency
        
        lfo.start();
        nodesRef.current.push(lfo, lfoGain);
      }
      
      noiseSrc.start();
    } else if (theme === 'ethereal') {
      masterGain.gain.value = 0.3 * volume;
      // Create a nice ambient pad (A minor chord: A3, C4, E4)
      const frequencies = [220.00, 261.63, 329.63]; 
      
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const oscGain = ctx.createGain();
        oscGain.gain.value = 0; // Start quiet
        
        // Slow LFO for volume pulsing
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.05 + (i * 0.01); // Slightly different rates
        
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.2;
        
        lfo.connect(lfoGain);
        lfoGain.connect(oscGain.gain);
        
        // Base gain
        oscGain.gain.value = 0.2;

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        
        osc.start();
        lfo.start();
        
        nodesRef.current.push(osc, oscGain, lfo, lfoGain);
      });
    }

    setCurrentTheme(theme);
    setIsPlaying(true);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return { isPlaying, currentTheme, playTheme, stopAudio };
}
