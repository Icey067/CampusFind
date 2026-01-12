import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { LostFoundItem, User } from '../types';
import { MOCK_ITEMS } from '../constants';

// --- Configuration ---
// Note: In this environment, we may not have real keys. 
// This code is structured to work with real keys if provided, 
// otherwise it falls back to a Mock Service for demonstration.

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-key",
  authDomain: "campusfind-7a340.firebaseapp.com",
  projectId: "campusfind-7a340",
  storageBucket: "campusfind-7a340.firebasestorage.app",
  messagingSenderId: "803926365844",
  appId: "1:803926365844:web:11d1453f01f020346e8681",
  measurementId: "G-MW1KQVG6FD"
};

const isMock = import.meta.env.VITE_FIREBASE_API_KEY === undefined || import.meta.env.VITE_FIREBASE_API_KEY === 'your_firebase_key';

// --- Real Firebase Instances ---
let auth: any;
let db: any;
let storage: any;

if (!isMock) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

// --- Service Layer ---

export const loginWithGoogle = async (): Promise<User> => {
  if (isMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          uid: 'mock-user-123',
          displayName: 'Campus Student',
          email: 'student@university.edu',
          photoURL: 'https://picsum.photos/id/64/100/100'
        });
      }, 800);
    });
  }

  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user as FirebaseUser;
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL
  };
};

// In-memory store for the session
let mockStore: LostFoundItem[] = [...MOCK_ITEMS];

export const fetchItems = async (): Promise<LostFoundItem[]> => {
  if (isMock) {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockStore].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())), 500);
    });
  }

  const q = query(collection(db, "items"), orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LostFoundItem));
};

export const createItem = async (item: Omit<LostFoundItem, 'id'>): Promise<LostFoundItem> => {
  if (isMock) {
    return new Promise((resolve) => {
      const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
      mockStore = [newItem, ...mockStore];
      setTimeout(() => resolve(newItem), 1000);
    });
  }

  const docRef = await addDoc(collection(db, "items"), item);
  return { id: docRef.id, ...item };
};

export const uploadImage = async (base64Data: string): Promise<string> => {
  if (isMock) {
    return new Promise((resolve) => setTimeout(() => resolve(base64Data), 500)); // Just return base64 as URL for mock
  }

  const storageRef = ref(storage, `images/${Date.now()}.jpg`);
  await uploadString(storageRef, base64Data, 'data_url');
  return getDownloadURL(storageRef);
};
