import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Entry, Collection, SavedEntry, CollectionType, User } from '../types';
import * as storage from '../services/storageService';
import { useAuth } from './AuthContext';

interface AppContextType {
  entries: Entry[];
  collections: Collection[];
  savedEntries: SavedEntry[];
  users: User[];
  addEntry: (entry: Entry) => Promise<void>;
  editEntry: (entry: Entry) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  toggleLike: (entryId: string) => Promise<void>;
  createCollection: (name: string, type: CollectionType) => Promise<Collection>;
  saveToCollection: (entryId: string, collectionId: string) => Promise<void>;
  removeFromCollection: (savedId: string) => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [savedEntriesState, setSavedEntriesState] = useState<SavedEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    try {
        const [fetchedEntries, fetchedCollections, fetchedSaved, fetchedUsers] = await Promise.all([
            storage.getEntries(),
            storage.getCollections(),
            storage.getSavedEntries(),
            storage.getUsers()
        ]);
        setEntries(fetchedEntries);
        setCollections(fetchedCollections);
        setSavedEntriesState(fetchedSaved);
        setUsers(fetchedUsers);
    } catch (error) {
        console.error("Failed to refresh data", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Sync users when auth state changes
  useEffect(() => {
      if(user) refreshData();
  }, [user]);

  // Init defaults
  useEffect(() => {
    if (!user || isLoading) return;
    const userColls = collections.filter(c => c.userId === user.id);
    if (userColls.length === 0) {
       // logic to create default collections could happen here or backend
       // For this setup, we'll assume user creates them or we call API sequentially
       const defaults: { name: string; type: CollectionType }[] = [
        { name: 'My words', type: 'word' },
        { name: 'My Idioms', type: 'idiom' },
        { name: 'My Thoughts', type: 'thought' },
        { name: 'All', type: 'general' }
      ];
      // Note: This might trigger multiple API calls in quick succession
      defaults.forEach(async (d) => {
         await createCollection(d.name, d.type); 
      });
    }
  }, [user, isLoading]); // Careful with dependencies to avoid loops

  const addEntry = async (entry: Entry) => {
    await storage.addEntryToStorage(entry);
    refreshData();
  };

  const editEntry = async (entry: Entry) => {
    await storage.updateEntryInStorage(entry);
    refreshData();
  };

  const removeEntry = async (id: string) => {
    await storage.deleteEntryFromStorage(id);
    refreshData();
  };

  const createCollection = async (name: string, type: CollectionType): Promise<Collection> => {
     if (!user) throw new Error("No user");
     // ID will be assigned by server
     const newColl = {
        id: "", 
        userId: user.id,
        name,
        type,
        createdAt: new Date().toISOString()
     } as Collection;
     
     const created = await storage.addCollection(newColl);
     setCollections(prev => [...prev, created]);
     return created;
  };

  const saveToCollection = async (entryId: string, collectionId: string) => {
    if (!user) return;
    const newSave = {
        id: "",
        userId: user.id,
        entryId,
        collectionId,
        savedAt: new Date().toISOString()
    } as SavedEntry;
    await storage.addSavedEntry(newSave);
    refreshData();
  };

  const removeFromCollection = async (savedId: string) => {
    await storage.removeSavedEntry(savedId);
    refreshData();
  };

  const toggleLike = async (entryId: string) => {
    if (!user) return;
    
    // 1. Toggle like on server
    const updatedEntry = await storage.toggleLikeInStorage(entryId, user.id);
    
    // 2. Refresh lists
    // Note: Auto-save logic to "Liked Posts" should ideally move to backend 
    // or be implemented here by checking state after update
    refreshData();
    
    // Client-side mimic of auto-save logic for immediate feedback if needed
    // For now, simpler to rely on refreshData or manual re-implementation
    const currentLikes = updatedEntry.likes || [];
    const isLiked = currentLikes.includes(user.id);

    const likedCollectionName = "Liked Posts";
    if (isLiked) {
       let targetColl = collections.find(c => c.userId === user.id && c.name === likedCollectionName);
       if (!targetColl) {
           targetColl = await createCollection(likedCollectionName, 'general');
       }
       const alreadySaved = savedEntriesState.some(s => 
           s.userId === user.id && s.entryId === entryId && s.collectionId === targetColl!.id
       );
       if (!alreadySaved) {
           await saveToCollection(entryId, targetColl.id);
       }
    } else {
       const targetColl = collections.find(c => c.userId === user.id && c.name === likedCollectionName);
       if (targetColl) {
           const savedEntry = savedEntriesState.find(s => 
               s.userId === user.id && s.entryId === entryId && s.collectionId === targetColl.id
           );
           if (savedEntry) {
               await removeFromCollection(savedEntry.id);
           }
       }
    }
  };

  return (
    <AppContext.Provider value={{ 
      entries, 
      addEntry, 
      editEntry,
      removeEntry, 
      toggleLike,
      isLoading,
      collections,
      savedEntries: savedEntriesState,
      users,
      createCollection,
      saveToCollection,
      removeFromCollection
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};