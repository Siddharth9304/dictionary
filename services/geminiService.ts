import api from './api';
import { AIGeneratedVocab, AIGeneratedIdiom } from '../types';

export const generateVocabDetails = async (word: string): Promise<AIGeneratedVocab> => {
  try {
    const res = await api.post('/ai/vocab', { word });
    return res.data;
  } catch (e) {
    console.error("AI Error", e);
    throw new Error("Failed to generate vocab details");
  }
};

export const generateIdiomDetails = async (idiomPhrase: string): Promise<AIGeneratedIdiom> => {
  try {
    const res = await api.post('/ai/idiom', { phrase: idiomPhrase });
    return res.data;
  } catch (e) {
     console.error("AI Error", e);
    throw new Error("Failed to generate idiom details");
  }
};

export const generateSpeech = async (text: string): Promise<AudioBuffer | null> => {
  try {
    const res = await api.post('/ai/speech', { text });
    const base64Audio = res.data.audioData;
    
    if (!base64Audio) return null;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass({sampleRate: 24000});
    
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      audioContext,
      24000,
      1
    );
    
    // Close context immediately as we just needed to decode
    if (audioContext.state !== 'closed') {
        audioContext.close();
    }
    return audioBuffer;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len % 2 === 0 ? len : len + 1);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}