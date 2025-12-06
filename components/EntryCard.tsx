
import React, { useState } from 'react';
import { Entry } from '../types';
import { Quote, BookOpen, MessageCircle, Lock, Bookmark, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { SaveCollectionDialog } from './SaveCollectionDialog';
import { VoicePlayer } from './VoicePlayer';

interface EntryCardProps {
  entry: Entry;
  onClick: () => void;
  showVocab?: boolean;
  showIdiom?: boolean;
  showThought?: boolean;
}

export const EntryCard: React.FC<EntryCardProps> = ({ 
  entry, 
  onClick,
  showVocab = true,
  showIdiom = true,
  showThought = true
}) => {
  const { user } = useAuth();
  const { savedEntries, toggleLike, collections, users } = useApp();
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Check if saved in ANY collection EXCEPT "Liked Posts"
  const isSaved = user ? savedEntries.some(s => {
    if (s.userId !== user.id || s.entryId !== entry.id) return false;
    const collection = collections.find(c => c.id === s.collectionId);
    // Return true only if it's in a collection AND that collection is NOT "Liked Posts"
    return collection && collection.name !== 'Liked Posts';
  }) : false;
  
  // Likes
  const likes = entry.likes || [];
  const isLiked = user ? likes.includes(user.id) : false;
  const likeCount = likes.length;

  const likedByNames = users
    .filter(u => likes.includes(u.id))
    .map(u => u.name);
  
  const likeTooltip = likedByNames.length > 0
    ? `Liked by ${likedByNames.slice(0, 3).join(', ')}${likedByNames.length > 3 ? ` and ${likedByNames.length - 3} others` : ''}`
    : (isLiked ? "Unlike" : "Like");

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
  };

  // If no sections are selected, show all (fallback)
  const isAllHidden = !showVocab && !showIdiom && !showThought;
  const renderVocab = showVocab || isAllHidden;
  const renderIdiom = showIdiom || isAllHidden;
  const renderThought = showThought || isAllHidden;

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSaveDialog(true);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(entry.id);
  };

  return (
    <>
      <div 
        onClick={onClick}
        className="group relative bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] border border-slate-100 hover:border-indigo-100/50 transition-all duration-300 cursor-pointer break-inside-avoid mb-6 hover:-translate-y-1"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center">
                  {getInitials(entry.studentName)}
              </div>
              <span className="text-xs font-semibold text-slate-500 truncate max-w-[100px]">{entry.studentName}</span>
          </div>
          <div className="flex items-center gap-2">
              {entry.visibility === 'private' && (
                  <Lock size={12} className="text-slate-400" />
              )}
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full uppercase tracking-wide">
                  {formatDate(entry.date)}
              </span>
              
              {/* Like Button */}
              {user && (
                 <button 
                  onClick={handleLikeClick}
                  className={`p-1.5 flex items-center gap-1 rounded-full transition-all group/like relative ${isLiked ? 'text-rose-500 bg-rose-50' : 'text-slate-300 hover:text-rose-500 hover:bg-slate-50'}`}
                  title={likeTooltip}
                >
                  <Heart size={14} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "animate-in zoom-in" : ""} />
                  {likeCount > 0 && <span className="text-[10px] font-bold">{likeCount}</span>}
                </button>
              )}

              {/* Save Button */}
              {user && (
                <button 
                  onClick={handleSaveClick}
                  className={`p-1.5 rounded-full transition-colors ${isSaved ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300 hover:text-indigo-500 hover:bg-slate-50'}`}
                  title={isSaved ? "Saved to collection" : "Save to collection"}
                >
                  <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
                </button>
              )}
          </div>
        </div>

        {/* Content Stack */}
        <div className="space-y-4">
          {/* Vocab */}
          {renderVocab && (
              <div>
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-indigo-500">
                        <BookOpen size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Word</span>
                    </div>
                    {/* Compact Voice Player for quick pronunciation */}
                    <div className="scale-75 origin-right" onClick={(e) => e.stopPropagation()}>
                        <VoicePlayer text={entry.vocabulary.word} label=" " />
                    </div>
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                    {entry.vocabulary.word}
                </h3>
              </div>
          )}

          {/* Idiom */}
          {renderIdiom && (
              <div className={renderVocab ? "pt-3 border-t border-slate-50" : ""}>
              <div className="flex items-center gap-1.5 mb-1 text-emerald-500">
                  <MessageCircle size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Idiom</span>
              </div>
              <p className="text-sm font-medium text-slate-700 italic truncate">
                  "{entry.idiom.phrase}"
              </p>
              </div>
          )}

          {/* Thought */}
          {renderThought && (
              <div className={(renderVocab || renderIdiom) ? "pt-3 border-t border-slate-50" : ""}>
              <div className="flex items-center gap-1.5 mb-1 text-amber-500">
                  <Quote size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Thought</span>
              </div>
              <p className="text-sm font-serif text-slate-600 line-clamp-2 leading-relaxed">
                  {entry.thought.thought}
              </p>
              </div>
          )}
        </div>
        
        {/* Hover visual cue */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl opacity-80" />
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
