
import React, { useEffect, useState } from 'react';
import { Entry } from '../types';
import { Quote, BookOpen, MessageCircle, X, Trash2, Calendar, User, Bookmark, Pencil, Heart } from 'lucide-react';
import { VoicePlayer } from './VoicePlayer';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { SaveCollectionDialog } from './SaveCollectionDialog';
import { useNavigate } from 'react-router-dom';

interface EntryModalProps {
  entry: Entry;
  onClose: () => void;
}

export const EntryModal: React.FC<EntryModalProps> = ({ entry, onClose }) => {
  const { user } = useAuth();
  const { removeEntry, savedEntries, toggleLike, users, collections } = useApp();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const navigate = useNavigate();
  
  const isOwner = user?.id === entry.userId;
  
  // Check if saved in ANY collection EXCEPT "Liked Posts"
  const isSaved = user ? savedEntries.some(s => {
    if (s.userId !== user.id || s.entryId !== entry.id) return false;
    const collection = collections.find(c => c.id === s.collectionId);
    return collection && collection.name !== 'Liked Posts';
  }) : false;

  // Likes
  const likes = entry.likes || [];
  const isLiked = user ? likes.includes(user.id) : false;
  const likeCount = likes.length;

  // Resolve liked users
  const likedByUsers = users.filter(u => likes.includes(u.id));

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      removeEntry(entry.id);
      onClose();
    }
  };

  const handleEdit = () => {
    onClose();
    navigate(`/edit/${entry.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
        
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
          
          {/* Modal Header */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 sm:p-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <User size={20} />
                  </div>
                  <div>
                      <h3 className="font-bold text-slate-900">{entry.studentName}</h3>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                          <Calendar size={12} />
                          {formatDate(entry.date)}
                      </div>
                  </div>
              </div>

              <div className="flex items-center gap-2">
                  <button 
                      onClick={() => toggleLike(entry.id)}
                      className={`p-2 flex items-center gap-1.5 rounded-full transition-colors ${isLiked ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'}`}
                      title={isLiked ? "Unlike" : "Like"}
                  >
                      <Heart size={20} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "animate-in zoom-in" : ""} />
                      {likeCount > 0 && <span className="text-xs font-bold">{likeCount}</span>}
                  </button>

                  <button 
                      onClick={() => setShowSaveDialog(true)}
                      className={`p-2 rounded-full transition-colors ${isSaved ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'}`}
                      title="Save to Collection"
                  >
                      <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
                  </button>

                  {isOwner && (
                      <>
                        <button 
                            onClick={handleEdit}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                            title="Edit Entry"
                        >
                            <Pencil size={20} />
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete Entry"
                        >
                            <Trash2 size={20} />
                        </button>
                      </>
                  )}
                  <button 
                      onClick={onClose}
                      className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                  >
                      <X size={24} />
                  </button>
              </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 sm:p-8 space-y-10">
            
            {/* Vocab Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-indigo-600">
                      <BookOpen size={20} />
                      <span className="text-sm font-bold uppercase tracking-wider">Vocabulary</span>
                  </div>
                  <VoicePlayer text={entry.vocabulary.word} />
              </div>
              
              <h2 className="text-4xl font-serif font-bold text-slate-900 mb-3">{entry.vocabulary.word}</h2>
              <p className="text-lg text-slate-700 leading-relaxed mb-4">{entry.vocabulary.meaning}</p>
              
              <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100/50 mb-6">
                  <p className="text-indigo-900/80 italic font-serif text-lg">"{entry.vocabulary.example}"</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Synonyms</span>
                      <div className="flex flex-wrap gap-2">
                          {entry.vocabulary.synonyms.map(s => (
                              <span key={s} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-sm rounded-md font-medium">{s}</span>
                          ))}
                      </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Antonyms</span>
                      <div className="flex flex-wrap gap-2">
                          {entry.vocabulary.antonyms.map(a => (
                              <span key={a} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-sm rounded-md font-medium">{a}</span>
                          ))}
                      </div>
                  </div>
              </div>
            </section>

            <div className="h-px bg-slate-100 w-full"></div>

            {/* Idiom Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-emerald-600">
                      <MessageCircle size={20} />
                      <span className="text-sm font-bold uppercase tracking-wider">Idiom</span>
                  </div>
                  <VoicePlayer text={entry.idiom.phrase} label="Listen" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 mb-2">"{entry.idiom.phrase}"</h3>
              <p className="text-slate-700 mb-4">{entry.idiom.meaning}</p>
              
              <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-100/50">
                  <p className="text-emerald-900/80 italic font-serif">"{entry.idiom.example}"</p>
              </div>
            </section>

            <div className="h-px bg-slate-100 w-full"></div>

            {/* Thought Section */}
            <section>
              <div className="flex items-center gap-2 text-amber-600 mb-4">
                  <Quote size={20} />
                  <span className="text-sm font-bold uppercase tracking-wider">Thought</span>
              </div>
              
              <blockquote className="text-2xl font-serif italic text-slate-800 leading-relaxed border-l-4 border-amber-300 pl-6 py-2 mb-4">
                  "{entry.thought.thought}"
              </blockquote>
              <p className="text-slate-600 pl-6">
                  <span className="font-semibold text-slate-900">Context: </span>
                  {entry.thought.meaning}
              </p>
            </section>

            {/* Liked By Section */}
            {likedByUsers.length > 0 && (
                <div className="border-t border-slate-100 pt-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Heart size={14} className="text-rose-400" fill="currentColor"/> 
                        Liked by
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {likedByUsers.map(u => (
                            <div key={u.id} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">
                                    {u.name[0]}
                                </div>
                                <span className="text-xs font-medium text-slate-700">{u.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

          </div>
        </div>
      </div>
      
      {showSaveDialog && (
        <SaveCollectionDialog 
          entryId={entry.id} 
          onClose={() => setShowSaveDialog(false)} 
        />
      )}
    </>
  );
};
