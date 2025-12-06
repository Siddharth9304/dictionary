
import React, { useState } from 'react';
import { Search, Loader2, BookOpen, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { generateVocabDetails } from '../services/geminiService';
import { VoicePlayer } from './VoicePlayer';
import { AIGeneratedVocab } from '../types';

export const DictionaryTool: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<AIGeneratedVocab | null>(null);
  const [searchedWord, setSearchedWord] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError('');
    setResult(null);
    
    try {
      const data = await generateVocabDetails(query);
      setResult(data);
      setSearchedWord(query);
    } catch (err) {
      console.error(err);
      setError('Could not find definition. Please check the spelling or try another word.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-serif font-bold text-slate-900 mb-3">Dictionary</h2>
        <p className="text-slate-500">Search for meanings, synonyms, and usage examples.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg shadow-indigo-500/5 border border-slate-100 p-2 mb-10 sticky top-24 z-10">
        <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-4 text-slate-400" size={20} />
            <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a word, idiom to define..." 
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-transparent text-lg font-medium placeholder:text-slate-400 focus:outline-none"
                autoFocus
            />
            <button 
                type="submit"
                disabled={!query.trim() || isLoading}
                className="absolute right-2 bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            </button>
        </form>
      </div>

      {error && (
        <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={32} />
            </div>
            <p className="text-slate-900 font-medium">{error}</p>
        </div>
      )}

      {result && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-50/50 p-8 border-b border-slate-100 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-600">
                                Definition
                             </span>
                        </div>
                        <h3 className="text-5xl font-serif font-bold text-slate-900 mb-2 capitalize">
                            {searchedWord}
                        </h3>
                    </div>
                    <div className="bg-white p-2 rounded-full shadow-sm border border-slate-100">
                        <VoicePlayer text={searchedWord} label="Pronounce" />
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                            <BookOpen size={16} /> Meaning
                        </h4>
                        <p className="text-xl text-slate-800 leading-relaxed font-medium">
                            {result.meaning}
                        </p>
                    </div>

                    <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
                        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Example Usage</h4>
                        <p className="text-lg text-indigo-900/80 italic font-serif">
                            "{result.example}"
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Synonyms</h4>
                            <div className="flex flex-wrap gap-2">
                                {result.synonyms.map((s, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-sm font-medium">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-3">Antonyms</h4>
                            <div className="flex flex-wrap gap-2">
                                {result.antonyms.map((a, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg text-sm font-medium">
                                        {a}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {!result && !isLoading && !error && (
        <div className="text-center py-20 opacity-40">
            <BookOpen size={64} className="mx-auto mb-4 text-slate-300" strokeWidth={1} />
            <p className="text-slate-500 font-serif text-lg">Enter a word above to explore its meaning.</p>
        </div>
      )}
    </div>
  );
};
