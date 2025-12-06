import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/AppLayout';
import { EntryForm } from './components/EntryForm';
import { EntryCard } from './components/EntryCard';
import { EntryModal } from './components/EntryModal';
import { Stats } from './components/Stats';
import { Login } from './components/Login';
import { MyDictionary } from './components/MyDictionary';
import { Profile } from './components/Profile';
import { DictionaryTool } from './components/DictionaryTool';
import { Search, Loader2, BookOpen, MessageCircle, Quote, Sparkles } from 'lucide-react';
import { Entry } from './types';

const Home: React.FC = () => {
  const { entries, isLoading } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  // View Filter State
  const [viewVocab, setViewVocab] = useState(true);
  const [viewIdiom, setViewIdiom] = useState(true);
  const [viewThought, setViewThought] = useState(true);

  // Only show Public entries in the main feed
  const publicEntries = entries.filter(e => e.visibility !== 'private');

  // Updated Filter Logic: Includes Vocabulary, Idiom, Thought, and Student Name
  const filteredEntries = publicEntries.filter(entry => 
    entry.vocabulary.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.idiom.phrase.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.thought.thought.toLowerCase().includes(searchTerm.toLowerCase()) || // Added Thought logic here
    entry.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-6 px-4 sm:px-8 max-w-[1600px] mx-auto">
      {/* Header Area */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 gap-6">
        <div className="w-full xl:w-auto">
           <div className="flex items-center gap-3 mb-1">
             <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">Class Feed</h1>
             {/* Entry Count Badge */}
             <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-200">
               {filteredEntries.length} {filteredEntries.length === 1 ? 'Entry' : 'Entries'}
             </span>
           </div>
           <p className="text-slate-500 text-sm sm:text-base">Daily wisdom from the community.</p>
        </div>
        
        <div className="flex flex-col-reverse md:flex-row gap-4 w-full xl:w-auto">
            {/* View Toggles */}
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-1 shadow-sm overflow-x-auto">
                <button
                    onClick={() => setViewVocab(!viewVocab)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${viewVocab ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <BookOpen size={14} /> Word
                </button>
                <div className="w-px h-4 bg-slate-200 mx-1 shrink-0"></div>
                <button
                    onClick={() => setViewIdiom(!viewIdiom)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${viewIdiom ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <MessageCircle size={14} /> Idiom
                </button>
                <div className="w-px h-4 bg-slate-200 mx-1 shrink-0"></div>
                <button
                    onClick={() => setViewThought(!viewThought)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${viewThought ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Quote size={14} /> Thought
                </button>
            </div>

            {/* Search */}
            <div className="relative flex-1 md:w-72 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors"/>
                </div>
                <input 
                    type="text" 
                    placeholder="Search words, names..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 shadow-sm transition-all text-sm"
                />
            </div>
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 text-slate-400">
           <Loader2 className="animate-spin mb-3" size={32} />
           <p>Loading inspiration...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-slate-200 text-center mx-auto max-w-lg">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
             <Sparkles className="text-slate-300" size={32} />
          </div>
          <p className="text-xl font-serif text-slate-600 mb-2">No entries found.</p>
          <p className="text-slate-400 text-sm">
            {searchTerm ? "Try adjusting your search terms." : "Be the first to share something new today!"}
          </p>
        </div>
      ) : (
        /* CSS Grid for straight alignment */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
          {filteredEntries.map(entry => (
            <EntryCard 
                key={entry.id} 
                entry={entry} 
                onClick={() => setSelectedEntry(entry)}
                showVocab={viewVocab}
                showIdiom={viewIdiom}
                showThought={viewThought}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedEntry && (
        <EntryModal 
            entry={selectedEntry} 
            onClose={() => setSelectedEntry(null)} 
        />
      )}
    </div>
  );
};

// Guard component
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout>
                  <Home />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/add" element={
              <ProtectedRoute>
                <AppLayout>
                  <EntryForm />
                </AppLayout>
              </ProtectedRoute>
            } />
             <Route path="/edit/:id" element={
              <ProtectedRoute>
                <AppLayout>
                  <EntryForm />
                </AppLayout>
              </ProtectedRoute>
            } />
             <Route path="/my-dictionary" element={
              <ProtectedRoute>
                <AppLayout>
                  <MyDictionary />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/dictionary" element={
              <ProtectedRoute>
                <AppLayout>
                  <DictionaryTool />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/stats" element={
              <ProtectedRoute>
                <AppLayout>
                  <Stats />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;