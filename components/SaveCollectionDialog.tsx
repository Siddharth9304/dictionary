import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { CollectionType } from '../types';
import { Plus, Check, Bookmark, Folder, X, BookOpen, MessageCircle, Quote } from 'lucide-react';

interface SaveCollectionDialogProps {
  entryId: string;
  onClose: () => void;
}

export const SaveCollectionDialog: React.FC<SaveCollectionDialogProps> = ({ entryId, onClose }) => {
  const { user } = useAuth();
  const { collections, savedEntries, createCollection, saveToCollection, removeFromCollection } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionType, setNewCollectionType] = useState<CollectionType>('general');

  if (!user) return null;

  const userCollections = collections.filter(c => c.userId === user.id);
  
  // Find which collections this entry is already saved in
  const savedIn = savedEntries.filter(s => s.userId === user.id && s.entryId === entryId);

  const toggleSave = (collectionId: string) => {
    const existingSave = savedIn.find(s => s.collectionId === collectionId);
    if (existingSave) {
      removeFromCollection(existingSave.id);
    } else {
      saveToCollection(entryId, collectionId);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      const newColl = createCollection(newCollectionName.trim(), newCollectionType);
      // Auto save to new collection
      saveToCollection(entryId, newColl.id);
      setNewCollectionName('');
      setIsCreating(false);
    }
  };

  const getIconForType = (type: CollectionType) => {
    switch (type) {
        case 'word': return <BookOpen size={18} />;
        case 'idiom': return <MessageCircle size={18} />;
        case 'thought': return <Quote size={18} />;
        default: return <Folder size={18} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>
       <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h3 className="font-bold text-slate-900">Save to collection</h3>
             <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={20} />
             </button>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto p-2">
             {userCollections.length === 0 && (
                 <p className="text-center text-slate-400 text-sm py-4">No collections yet.</p>
             )}
             {userCollections.map(collection => {
                const isSaved = savedIn.some(s => s.collectionId === collection.id);
                return (
                  <button
                    key={collection.id}
                    onClick={() => toggleSave(collection.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group"
                  >
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSaved ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                           {isSaved ? <Bookmark size={18} fill="currentColor" /> : getIconForType(collection.type || 'general')}
                        </div>
                        <div className="text-left">
                            <span className={`block font-medium ${isSaved ? 'text-indigo-900' : 'text-slate-600'}`}>
                            {collection.name}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                {collection.type || 'general'}
                            </span>
                        </div>
                     </div>
                     {isSaved && <Check size={18} className="text-indigo-600" />}
                  </button>
                );
             })}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
             {isCreating ? (
                <form onSubmit={handleCreate} className="space-y-3">
                   <input 
                     autoFocus
                     type="text" 
                     value={newCollectionName}
                     onChange={(e) => setNewCollectionName(e.target.value)}
                     placeholder="Collection name..."
                     className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                   />
                   
                   <div className="flex gap-1 bg-slate-200/50 p-1 rounded-lg">
                        {(['general', 'word', 'idiom', 'thought'] as CollectionType[]).map(type => (
                             <button
                                key={type}
                                type="button"
                                onClick={() => setNewCollectionType(type)}
                                className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${newCollectionType === type ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                             >
                                {type}
                             </button>
                        ))}
                   </div>

                   <button 
                     type="submit"
                     disabled={!newCollectionName.trim()}
                     className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold disabled:opacity-50"
                   >
                     Create Collection
                   </button>
                </form>
             ) : (
                <button 
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-white border border-dashed border-slate-300 rounded-lg hover:border-slate-400 transition-all"
                >
                   <Plus size={16} /> Create new collection
                </button>
             )}
          </div>
       </div>
    </div>
  );
};