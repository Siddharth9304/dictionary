import api from './api';
import { Entry, User, Collection, SavedEntry } from '../types';

// --- Entries ---

export const getEntries = async (): Promise<Entry[]> => {
  try {
    const res = await api.get('/entries');
    return res.data;
  } catch (error) {
    console.error("Failed to load entries", error);
    return [];
  }
};

export const addEntryToStorage = async (entry: Entry): Promise<Entry> => {
  const res = await api.post('/entries', entry);
  return res.data;
};

export const updateEntryInStorage = async (entry: Entry): Promise<Entry> => {
  const res = await api.put(`/entries/${entry.id}`, entry);
  return res.data;
};

export const deleteEntryFromStorage = async (id: string): Promise<void> => {
  await api.delete(`/entries/${id}`);
};

export const toggleLikeInStorage = async (entryId: string, userId: string): Promise<Entry> => {
  const res = await api.post(`/entries/${entryId}/like`, { userId });
  return res.data;
};

// --- Users & Session ---

export const getUsers = async (): Promise<User[]> => {
    try {
        const res = await api.get('/auth');
        return res.data;
    } catch (error) {
        return [];
    }
};

export const loginUser = async (username: string, password?: string): Promise<User | null> => {
    try {
        const res = await api.post('/auth/login', { username, password });
        return res.data;
    } catch (error) {
        console.error("Login failed", error);
        return null;
    }
};

export const registerUser = async (username: string, name: string, password?: string, classCode?: string): Promise<User | null> => {
    try {
        const res = await api.post('/auth/register', { username, name, password, classCode });
        return res.data;
    } catch (error) {
        console.error("Register failed", error);
        throw Error(error.response?.data?.message || "something went wrong");
        return null;
    }
};

export const getUserById = async (id: string): Promise<User | null> => {
    try {
        const res = await api.get(`/auth/${id}`);
        return res.data;
    } catch (error) {
        return null;
    }
};

const SESSION_KEY = 'bocc46_session_user_id';
export const getSessionUserId = (): string | null => localStorage.getItem(SESSION_KEY);
export const setSessionUserId = (id: string): void => localStorage.setItem(SESSION_KEY, id);
export const clearSessionUserId = (): void => localStorage.removeItem(SESSION_KEY);

// --- Collections ---

export const getCollections = async (): Promise<Collection[]> => {
  try {
    const res = await api.get('/collections');
    return res.data;
  } catch (error) {
    return [];
  }
};

export const addCollection = async (collection: Collection): Promise<Collection> => {
  const res = await api.post('/collections', collection);
  return res.data;
};

// --- Saved Entries ---

export const getSavedEntries = async (): Promise<SavedEntry[]> => {
  try {
    const res = await api.get('/collections/saved');
    return res.data;
  } catch (error) {
    return [];
  }
};

export const addSavedEntry = async (savedEntry: SavedEntry): Promise<SavedEntry> => {
  const res = await api.post('/collections/saved', savedEntry);
  return res.data;
};

export const removeSavedEntry = async (id: string): Promise<void> => {
  await api.delete(`/collections/saved/${id}`);
};