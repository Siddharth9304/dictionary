
export interface VocabWord {
  word: string;
  meaning: string;
  synonyms: string[];
  antonyms: string[];
  example: string;
}

export interface Idiom {
  phrase: string;
  meaning: string;
  example: string;
}

export interface DailyThought {
  thought: string;
  meaning: string;
  example?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  joinedAt: string;
  password?: string;
}

export interface Entry {
  id: string;
  userId: string;
  date: string;
  studentName: string;
  visibility: 'public' | 'private';
  vocabulary: VocabWord;
  idiom: Idiom;
  thought: DailyThought;
  likes?: string[]; // Array of User IDs who liked the post
}

export interface AIGeneratedVocab {
  meaning: string;
  synonyms: string[];
  antonyms: string[];
  example: string;
}

export interface AIGeneratedIdiom {
  meaning: string;
  example: string;
}

export type CollectionType = 'general' | 'word' | 'idiom' | 'thought';

export interface Collection {
  id: string;
  userId: string;
  name: string;
  type: CollectionType;
  isDefault?: boolean;
  createdAt: string;
}

export interface SavedEntry {
  id: string;
  userId: string;
  entryId: string;
  collectionId: string;
  savedAt: string;
}
