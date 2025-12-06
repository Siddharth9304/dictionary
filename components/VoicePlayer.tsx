import React, { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';

interface VoicePlayerProps {
  text: string;
  label?: string;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({ text, label }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion if inside a clickable card
    if (isLoading || isPlaying) return;

    setIsLoading(true);
    let audioContext: AudioContext | null = null;
    
    try {
      const buffer = await generateSpeech(text);
      if (buffer) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContext = new AudioContextClass();
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        
        source.onended = () => {
          setIsPlaying(false);
          // Cleanup context after playing
          if (audioContext && audioContext.state !== 'closed') {
             audioContext.close();
          }
        };
        
        setIsPlaying(true);
        source.start(0);
      }
    } catch (err) {
      console.error("Failed to play audio", err);
      // Clean up if start fails
      if (audioContext && audioContext.state !== 'closed') {
         audioContext.close();
      }
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePlay}
      disabled={isLoading || isPlaying}
      className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50"
      title="Listen to pronunciation"
    >
      {isLoading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Volume2 size={14} className={isPlaying ? 'text-primary animate-pulse' : ''} />
      )}
      {label || "Pronounce"}
    </button>
  );
};