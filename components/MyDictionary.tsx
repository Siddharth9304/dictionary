import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { EntryCard } from './EntryCard';
import { EntryModal } from './EntryModal';
import { Book, PlusCircle, BookOpen, MessageCircle, Quote, Bookmark, Folder, ChevronRight, ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Entry, CollectionType } from '../types';

export const MyDictionary: React.FC = () => {
  const { entries, collections, savedEntries, isLoading } = useApp();
  const { user } = useAuth();
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  
  // Tabs: 'my-entries' | 'collections'
  const [activeTab, setActiveTab] = useState<'my-entries' | 'collections'>('my-entries');
  // Selected collection ID for viewing details
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  // Collection Category Filter
  const [collectionFilter, setCollectionFilter] = useState<CollectionType | 'all'>('all');

  // View Filter State
  const [viewVocab, setViewVocab] = useState(true);
  const [viewIdiom, setViewIdiom] = useState(true);
  const [viewThought, setViewThought] = useState(true);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) return null;

  // -- Helper: Filtering Logic --
  const filterEntries = (entryList: Entry[]) => {
    return entryList.filter(entry => {
      // 1. Check Search Term
      const matchesSearch = 
        entry.vocabulary.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.idiom.phrase.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.thought.thought.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.studentName.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // 2. Check View Toggles
      // An entry should be visible if it has content for at least one active toggle.
      // Logic:
      // - Is there content for Vocab? AND is Vocab view enabled?
      // - OR Is there content for Idiom? AND is Idiom view enabled?
      // - OR Is there content for Thought? AND is Thought view enabled?
      
      const hasVocab = entry.vocabulary.word.trim().length > 0;
      const hasIdiom = entry.idiom.phrase.trim().length > 0;
      const hasThought = entry.thought.thought.trim().length > 0;

      // If all toggles are off, show nothing (or show all as fallback, depending on UX choice. Here we hide).
      if (!viewVocab && !viewIdiom && !viewThought) return false;

      const matchesVocab = viewVocab && hasVocab;
      const matchesIdiom = viewIdiom && hasIdiom;
      const matchesThought = viewThought && hasThought;

      return matchesVocab || matchesIdiom || matchesThought;
    });
  };

  // -- Data Logic --
  
  // 1. My Entries
  const rawMyEntries = entries.filter(entry => entry.userId === user.id);
  const filteredMyEntries = filterEntries(rawMyEntries);

  // 2. Collections
  const userCollections = collections.filter(c => c.userId === user.id);
  const filteredCollections = collectionFilter === 'all' 
    ? userCollections 
    : userCollections.filter(c => (c.type || 'general') === collectionFilter);
  
  // 3. Entries in selected collection
  const getEntriesInCollection = (collectionId: string) => {
    const savedInThis = savedEntries
        .filter(s => s.collectionId === collectionId)
        .map(s => s.entryId);
    const rawCollectionEntries = entries.filter(e => savedInThis.includes(e.id));
    return filterEntries(rawCollectionEntries); // Apply filters/search to collection view too
  };

  // Effect: When opening a collection, auto-set view filters based on collection type
  useEffect(() => {
    if (selectedCollectionId) {
        const collection = userCollections.find(c => c.id === selectedCollectionId);
        if (collection) {
            if (collection.type === 'word') {
                setViewVocab(true); setViewIdiom(false); setViewThought(false);
            } else if (collection.type === 'idiom') {
                setViewVocab(false); setViewIdiom(true); setViewThought(false);
            } else if (collection.type === 'thought') {
                setViewVocab(false); setViewIdiom(false); setViewThought(true);
            } else {
                // General
                setViewVocab(true); setViewIdiom(true); setViewThought(true);
            }
        }
    } else {
        // Reset when switching back to "My Entries" or similar if desired
        // setViewVocab(true); setViewIdiom(true); setViewThought(true);
    }
  }, [selectedCollectionId, userCollections]);

  const getIconForType = (type: CollectionType) => {
    switch (type) {
        case 'word': return <BookOpen size={24} />;
        case 'idiom': return <MessageCircle size={24} />;
        case 'thought': return <Quote size={24} />;
        default: return <Folder size={24} />;
    }
  };

  const renderContent = () => {
    // LOADING
    if (isLoading) {
        return <div className="text-center py-24 text-slate-400">Loading...</div>;
    }

    // TAB: COLLECTIONS -> VIEW SINGLE COLLECTION
    if (activeTab === 'collections' && selectedCollectionId) {
        const collection = userCollections.find(c => c.id === selectedCollectionId);
        if (!collection) return null;
        
        const collectionEntries = getEntriesInCollection(selectedCollectionId);
        
        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <button 
                    onClick={() => { setSelectedCollectionId(null); setSearchTerm(''); }}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium"
                >
                    <ArrowLeft size={18} /> Back to Collections
                </button>
                
                <div className="mb-8 border-b border-slate-200 pb-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2 block">{collection.type || 'General'} Collection</span>
                            <h3 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
                                {collection.name}
                            </h3>
                            <p className="text-slate-500 mt-2">{collectionEntries.length} items visible</p>
                        </div>
                        <div className="bg-slate-100 p-4 rounded-2xl text-slate-400">
                             {getIconForType(collection.type || 'general')}
                        </div>
                    </div>
                </div>

                {collectionEntries.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-500">
                          {searchTerm 
                            ? "No entries match your search." 
                            : "No entries saved in this collection."}
                        </p>
                    </div>
                ) : (
                    /* UPDATED: CSS Grid for straight rows */
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {collectionEntries.map(entry => (
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
            </div>
        );
    }

    // TAB: COLLECTIONS -> LIST
    if (activeTab === 'collections') {
        return (
            <div className="animate-in fade-in duration-300">
                {/* Collection Categories */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {(['all', 'general', 'word', 'idiom', 'thought'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => setCollectionFilter(type)}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                                collectionFilter === type 
                                ? 'bg-slate-900 text-white border-slate-900' 
                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {filteredCollections.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <p>No collections found for this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCollections.map(collection => {
                            // Helper to get ALL entries in this collection (for preview count)
                            // without applying search/view filters strictly for the preview bubbles
                            const savedInThis = savedEntries
                                .filter(s => s.collectionId === collection.id)
                                .map(s => s.entryId);
                            const allEntriesInCollection = entries.filter(e => savedInThis.includes(e.id));
                            
                            const count = allEntriesInCollection.length;
                            const previewEntries = allEntriesInCollection.slice(0, 3);
                            
                            return (
                                <button 
                                    key={collection.id}
                                    onClick={() => { setSelectedCollectionId(collection.id); setSearchTerm(''); }}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all text-left group flex flex-col h-full"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl transition-colors ${
                                            collection.type === 'word' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' :
                                            collection.type === 'idiom' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' :
                                            collection.type === 'thought' ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white' :
                                            'bg-slate-100 text-slate-600 group-hover:bg-slate-600 group-hover:text-white'
                                        }`}>
                                            {getIconForType(collection.type || 'general')}
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{count}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{collection.name}</h3>
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-6">{collection.type || 'General'} Collection</p>
                                    
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                        <div className="flex -space-x-2">
                                            {previewEntries.map(e => (
                                                <div key={e.id} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500">
                                                    {e.studentName[0]}
                                                </div>
                                            ))}
                                            {count > 3 && (
                                                <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-400">
                                                    +{count - 3}
                                                </div>
                                            )}
                                            {count === 0 && <span className="text-xs text-slate-300 italic">Empty</span>}
                                        </div>
                                        <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // TAB: MY ENTRIES (Default)
    if (rawMyEntries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-slate-200 text-center animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-6">
                    <Book size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Your dictionary is empty</h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Start building your personal collection of words, idioms and thoughts today.</p>
                <Link 
                    to="/add" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-medium"
                >
                    <PlusCircle size={20} />
                    Start Writing
                </Link>
            </div>
        );
    }

    if (filteredMyEntries.length === 0) {
        return (
            <div className="text-center py-24 text-slate-400">
                <p>No entries match your search or filters.</p>
            </div>
        );
    }

    return (
        /* UPDATED: CSS Grid for straight rows */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {filteredMyEntries.map(entry => (
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
    );
  };

  return (
    <div className="py-6 px-4 sm:px-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 gap-6">
        <div className="w-full xl:w-auto">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Book size={24} />
             </div>
             <h2 className="text-3xl font-serif font-bold text-slate-900">Library</h2>
           </div>
           <p className="text-slate-500">Manage your posts and saved collections.</p>
        </div>

        {/* Toolbar: Search + View Filters */}
        <div className="flex flex-col-reverse md:flex-row gap-4 w-full xl:w-auto">
            
            {/* View Filters (Only show when NOT looking at collections list) */}
            {activeTab !== 'collections' || selectedCollectionId ? (
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
            ) : null}

            {/* Search Box (Only show when NOT looking at collections list) */}
            {activeTab !== 'collections' || selectedCollectionId ? (
                <div className="relative flex-1 md:w-64 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors"/>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 shadow-sm transition-all text-sm"
                    />
                </div>
            ) : null}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-6 border-b border-slate-200 mb-8">
        <button 
            onClick={() => { setActiveTab('my-entries'); setSelectedCollectionId(null); setSearchTerm(''); }}
            className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'my-entries' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
            <span className="flex items-center gap-2">
                <Book size={18} /> My Posts
            </span>
            {activeTab === 'my-entries' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></div>}
        </button>
        <button 
            onClick={() => { setActiveTab('collections'); setSelectedCollectionId(null); setSearchTerm(''); }}
            className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'collections' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
            <span className="flex items-center gap-2">
                <Bookmark size={18} /> Collections
            </span>
            {activeTab === 'collections' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></div>}
        </button>
      </div>

      {/* Main Content Render */}
      {renderContent()}

      {selectedEntry && (
        <EntryModal 
            entry={selectedEntry} 
            onClose={() => setSelectedEntry(null)} 
        />
      )}
    </div>
  );
};