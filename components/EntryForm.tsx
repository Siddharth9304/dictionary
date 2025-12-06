
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sparkles, Save, Loader2, Book, MessageCircle, Lightbulb, Globe, Lock, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Entry } from '../types';
import { generateVocabDetails, generateIdiomDetails } from '../services/geminiService';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const EntryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entries, addEntry, editEntry } = useApp();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState<'vocab' | 'idiom' | null>(null);

  // Edit Mode state
  const isEditMode = !!id;

  // Entry Settings
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  // Vocab State
  const [word, setWord] = useState('');
  const [vocabMeaning, setVocabMeaning] = useState('');
  const [synonyms, setSynonyms] = useState('');
  const [antonyms, setAntonyms] = useState('');
  const [vocabExample, setVocabExample] = useState('');

  // Idiom State
  const [idiomPhrase, setIdiomPhrase] = useState('');
  const [idiomMeaning, setIdiomMeaning] = useState('');
  const [idiomExample, setIdiomExample] = useState('');

  // Thought State
  const [thought, setThought] = useState('');
  const [thoughtMeaning, setThoughtMeaning] = useState('');

  // Load existing data if editing
  useEffect(() => {
    if (isEditMode && user && entries.length > 0) {
      const entryToEdit = entries.find(e => e.id === id);
      
      if (!entryToEdit) {
        // Entry not found
        navigate('/');
        return;
      }

      if (entryToEdit.userId !== user.id) {
        // Not authorized
        alert("You can only edit your own entries.");
        navigate('/');
        return;
      }

      // Populate form
      setVisibility(entryToEdit.visibility);
      setWord(entryToEdit.vocabulary.word);
      setVocabMeaning(entryToEdit.vocabulary.meaning);
      setSynonyms(entryToEdit.vocabulary.synonyms.join(', '));
      setAntonyms(entryToEdit.vocabulary.antonyms.join(', '));
      setVocabExample(entryToEdit.vocabulary.example);

      setIdiomPhrase(entryToEdit.idiom.phrase);
      setIdiomMeaning(entryToEdit.idiom.meaning);
      setIdiomExample(entryToEdit.idiom.example);

      setThought(entryToEdit.thought.thought);
      setThoughtMeaning(entryToEdit.thought.meaning);
    }
  }, [id, isEditMode, user, entries, navigate]);

  const handleAiFillVocab = async () => {
    if (!word) return;
    setAiLoading('vocab');
    try {
      const data = await generateVocabDetails(word);
      setVocabMeaning(data.meaning);
      setSynonyms(data.synonyms.join(', '));
      setAntonyms(data.antonyms.join(', '));
      setVocabExample(data.example);
    } catch (e) {
      console.error(e);
      alert("Could not auto-fill vocabulary details. Please check your API key or try again.");
    } finally {
      setAiLoading(null);
    }
  };

  const handleAiFillIdiom = async () => {
    if (!idiomPhrase) return;
    setAiLoading('idiom');
    try {
      const data = await generateIdiomDetails(idiomPhrase);
      setIdiomMeaning(data.meaning);
      setIdiomExample(data.example);
    } catch (e) {
      console.error(e);
      alert("Could not auto-fill idiom details.");
    } finally {
      setAiLoading(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    const commonData = {
      userId: user.id,
      studentName: user.name,
      visibility,
      vocabulary: {
        word,
        meaning: vocabMeaning,
        synonyms: synonyms.split(',').map(s => s.trim()).filter(Boolean),
        antonyms: antonyms.split(',').map(s => s.trim()).filter(Boolean),
        example: vocabExample
      },
      idiom: {
        phrase: idiomPhrase,
        meaning: idiomMeaning,
        example: idiomExample
      },
      thought: {
        thought,
        meaning: thoughtMeaning
      }
    };

    if (isEditMode && id) {
      // Update existing
      const existingEntry = entries.find(e => e.id === id);
      const updatedEntry: Entry = {
        ...commonData,
        id: id,
        date: existingEntry?.date || new Date().toISOString(), // Keep original date
        likes: existingEntry?.likes || [], // Preserve likes
      };
      editEntry(updatedEntry);
    } else {
      // Create new
      const newEntry: Entry = {
        ...commonData,
        id: generateId(),
        date: new Date().toISOString(),
        likes: []
      };
      addEntry(newEntry);
    }

    setTimeout(() => {
        setIsSubmitting(false);
        navigate(isEditMode ? '/my-dictionary' : '/');
    }, 600);
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
       <button
             type="button"
             onClick={() => navigate(-1)}
             className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium mb-6 transition-colors"
       >
         <ArrowLeft size={18} /> Back
       </button>

      <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
           <h2 className="text-4xl font-serif font-bold text-slate-900">{isEditMode ? 'Edit Entry' : 'Create Entry'}</h2>
           <p className="text-slate-500 mt-2 text-lg">Contributing as <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{user.name}</span></p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${visibility === 'public' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Globe size={16} /> Public
            </button>
            <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${visibility === 'private' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Lock size={16} /> Private
            </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* Vocabulary Section */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow">
          <div className="bg-indigo-50/50 p-6 border-b border-indigo-100/50 flex items-center gap-3">
             <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
               <Book size={24} strokeWidth={2}/>
             </div>
             <div>
               <h3 className="text-xl font-bold text-slate-900">Vocabulary Word</h3>
               <p className="text-sm text-slate-500">Share a new word you learned</p>
             </div>
          </div>
          
          <div className="p-6 md:p-8 grid gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Word</label>
              <div className="flex gap-3">
                <input 
                    type="text" 
                    required
                    value={word}
                    onChange={e => setWord(e.target.value)}
                    className="flex-1 rounded-xl border-slate-200 bg-slate-50 focus:bg-white shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 px-5 py-3 border transition-all text-lg font-serif font-bold text-slate-800 placeholder:font-sans placeholder:text-slate-400"
                    placeholder="e.g., Ephemeral"
                />
                <button
                    type="button"
                    onClick={handleAiFillVocab}
                    disabled={!word || aiLoading === 'vocab'}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200 active:scale-95"
                    title="Auto-fill details using AI"
                >
                    {aiLoading === 'vocab' ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20}/>}
                    <span className="hidden sm:inline font-medium">Auto-fill</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Meaning</label>
              <textarea 
                required
                value={vocabMeaning}
                onChange={e => setVocabMeaning(e.target.value)}
                rows={2}
                className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 px-4 py-3 border transition-all"
                placeholder="Definition of the word..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Synonyms</label>
                  <input 
                    type="text" 
                    value={synonyms}
                    onChange={e => setSynonyms(e.target.value)}
                    className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 px-4 py-3 border transition-all"
                    placeholder="e.g. Fleeting, Short-lived"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Antonyms</label>
                  <input 
                    type="text" 
                    value={antonyms}
                    onChange={e => setAntonyms(e.target.value)}
                    className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 px-4 py-3 border transition-all"
                    placeholder="e.g. Permanent, Enduring"
                  />
               </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Example Sentence</label>
              <textarea 
                required
                value={vocabExample}
                onChange={e => setVocabExample(e.target.value)}
                rows={2}
                className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 px-4 py-3 border transition-all italic text-slate-600"
                placeholder="Use the word in a sentence..."
              />
            </div>
          </div>
        </section>

        {/* Idiom Section */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow">
          <div className="bg-emerald-50/50 p-6 border-b border-emerald-100/50 flex items-center gap-3">
             <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
               <MessageCircle size={24} strokeWidth={2}/>
             </div>
             <div>
               <h3 className="text-xl font-bold text-slate-900">Idiom</h3>
               <p className="text-sm text-slate-500">A phrase with figurative meaning</p>
             </div>
          </div>

          <div className="p-6 md:p-8 grid gap-6">
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phrase</label>
              <div className="flex gap-3">
                <input 
                    type="text" 
                    required
                    value={idiomPhrase}
                    onChange={e => setIdiomPhrase(e.target.value)}
                    className="flex-1 rounded-xl border-slate-200 bg-slate-50 focus:bg-white shadow-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 px-5 py-3 border transition-all text-lg font-bold text-slate-800"
                    placeholder="e.g., Break the ice"
                />
                <button
                    type="button"
                    onClick={handleAiFillIdiom}
                    disabled={!idiomPhrase || aiLoading === 'idiom'}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-200 active:scale-95"
                >
                    {aiLoading === 'idiom' ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20}/>}
                    <span className="hidden sm:inline font-medium">Auto-fill</span>
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Meaning</label>
              <textarea 
                required
                value={idiomMeaning}
                onChange={e => setIdiomMeaning(e.target.value)}
                rows={2}
                className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white shadow-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 px-4 py-3 border transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Example Sentence</label>
              <textarea 
                required
                value={idiomExample}
                onChange={e => setIdiomExample(e.target.value)}
                rows={2}
                className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white shadow-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 px-4 py-3 border transition-all italic text-slate-600"
              />
            </div>
          </div>
        </section>

        {/* Thought Section */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow">
           <div className="bg-amber-50/50 p-6 border-b border-amber-100/50 flex items-center gap-3">
             <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
               <Lightbulb size={24} strokeWidth={2}/>
             </div>
             <div>
               <h3 className="text-xl font-bold text-slate-900">Thought of the Day</h3>
               <p className="text-sm text-slate-500">Something inspiring or insightful</p>
             </div>
          </div>

          <div className="p-6 md:p-8 grid gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quote / Thought</label>
              <textarea 
                required
                value={thought}
                onChange={e => setThought(e.target.value)}
                rows={3}
                className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 px-5 py-3 border transition-all font-serif italic text-lg text-slate-700"
                placeholder="e.g., The only way to do great work is to love what you do."
              />
            </div>
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Meaning / Context</label>
              <textarea 
                required
                value={thoughtMeaning}
                onChange={e => setThoughtMeaning(e.target.value)}
                rows={2}
                className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 px-4 py-3 border transition-all"
                placeholder="What does this thought inspire?"
              />
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 pb-10">
           <button
             type="button"
             onClick={() => navigate(-1)}
             className="px-8 py-3 rounded-xl text-slate-600 hover:bg-white hover:text-slate-900 font-bold transition-colors border border-transparent hover:border-slate-200"
           >
             Cancel
           </button>
           <button
             type="submit"
             disabled={isSubmitting}
             className="flex items-center gap-2 bg-slate-900 text-white px-10 py-3 rounded-xl hover:bg-slate-800 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:scale-100 shadow-xl shadow-slate-900/20 font-bold text-lg"
           >
             {isSubmitting ? <Loader2 className="animate-spin" size={24}/> : <Save size={24}/>}
             <span>{isEditMode ? 'Update Entry' : 'Publish'}</span>
           </button>
        </div>
      </form>
    </div>
  );
};
