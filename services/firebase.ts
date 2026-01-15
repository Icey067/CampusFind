import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, where, onSnapshot, serverTimestamp, setDoc, updateDoc, getDoc, limit } from 'firebase/firestore';
import { LostFoundItem, User, Message, Conversation } from '../types';
import { MOCK_ITEMS } from '../constants';

// --- Configuration ---
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

if (!isMock) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
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

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (isMock) {
    // In mock mode, auto-login the primary mock user immediately for demo purposes
    setTimeout(() => {
      callback({
        uid: 'mock-user-123',
        displayName: 'Campus Student',
        email: 'student@university.edu',
        photoURL: 'https://picsum.photos/id/64/100/100'
      });
    }, 100);
    return () => { };
  }
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      });
    } else {
      callback(null);
    }
  });
};

// In-memory store for the session
let mockStore: LostFoundItem[] = [...MOCK_ITEMS];
let mockMessages: Message[] = [];
let mockConversations: Conversation[] = [];
let mockUsers: Record<string, User> = {
  'mock-user-123': {
    uid: 'mock-user-123',
    displayName: 'Campus Student',
    email: 'student@university.edu',
    photoURL: 'https://picsum.photos/id/64/100/100'
  },
  'owner-1': {
    uid: 'owner-1',
    displayName: 'John Doe',
    email: 'john@university.edu',
    photoURL: 'https://i.pravatar.cc/150?u=owner-1'
  },
  'user1': {
    uid: 'user1',
    displayName: 'Sarah Miller',
    email: 'sarah@university.edu',
    photoURL: 'https://i.pravatar.cc/150?u=user1'
  },
  'user2': {
    uid: 'user2',
    displayName: 'Mike Ross',
    email: 'mike@university.edu',
    photoURL: 'https://i.pravatar.cc/150?u=user2'
  }
};

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

export const deleteItem = async (itemId: string): Promise<void> => {
  if (isMock) {
    return new Promise((resolve) => {
      mockStore = mockStore.filter(item => item.id !== itemId);
      setTimeout(() => resolve(), 500);
    });
  }

  await deleteDoc(doc(db, "items", itemId));
};

export const uploadImage = async (base64Data: string): Promise<string> => {
  // Free strategy: Store Base64 directly in Firestore record.
  // This avoids Firebase Storage billing limits entirely.
  return base64Data;
};

// --- Messaging Services ---

export const getUserById = async (uid: string): Promise<User | null> => {
  if (isMock) return mockUsers[uid] || null;

  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return docSnap.data() as User;
  return null;
};

export const getOrCreateConversation = async (participantIds: string[]): Promise<string> => {
  const sortedIds = [...participantIds].sort();
  const convoId = sortedIds.join('_');

  if (isMock) {
    const existing = mockConversations.find(c => c.id === convoId);
    if (!existing) {
      mockConversations.push({
        id: convoId,
        participants: sortedIds,
        updatedAt: new Date().toISOString()
      });
    }
    return convoId;
  }

  const convoRef = doc(db, "conversations", convoId);
  const convoSnap = await getDoc(convoRef);

  if (!convoSnap.exists()) {
    await setDoc(convoRef, {
      id: convoId,
      participants: sortedIds,
      updatedAt: serverTimestamp()
    });
  }

  return convoId;
};

export const sendMessage = async (convoId: string, message: Omit<Message, 'id' | 'timestamp' | 'read'>): Promise<void> => {
  const timestamp = new Date().toISOString();

  if (isMock) {
    const newMessage: Message = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      read: false
    };
    mockMessages.push(newMessage);

    const convoIdx = mockConversations.findIndex(c => c.id === convoId);
    if (convoIdx > -1) {
      mockConversations[convoIdx].lastMessage = newMessage;
      mockConversations[convoIdx].updatedAt = timestamp;
    }
    return;
  }

  const msgRef = await addDoc(collection(db, `conversations/${convoId}/messages`), {
    ...message,
    timestamp: serverTimestamp(),
    read: false
  });

  await updateDoc(doc(db, "conversations", convoId), {
    lastMessage: { ...message, id: msgRef.id, timestamp: new Date().toISOString() },
    updatedAt: serverTimestamp()
  });
};

export const subscribeToMessages = (convoId: string, callback: (messages: Message[]) => void) => {
  if (isMock) {
    callback(mockMessages.filter(m => {
      const sortedParts = [m.senderId, m.recipientId].sort();
      return sortedParts.join('_') === convoId;
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
    return () => { };
  }

  const q = query(collection(db, `conversations/${convoId}/messages`), orderBy("timestamp", "asc"));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    callback(messages);
  });
};

export const subscribeToConversations = (userId: string, callback: (conversations: Conversation[]) => void) => {
  if (isMock) {
    const convos = mockConversations.filter(c => c.participants.includes(userId))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Add other user info
    const enrichedConvos = convos.map(c => {
      const otherId = c.participants.find(id => id !== userId);
      return { ...c, otherUser: otherId ? mockUsers[otherId] : undefined };
    });

    callback(enrichedConvos);
    return () => { };
  }

  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(q, async (snapshot) => {
    const conversations = await Promise.all(snapshot.docs.map(async docSnapshot => {
      const data = docSnapshot.data() as Conversation;
      const otherId = data.participants.find(id => id !== userId);
      let otherUser;
      if (otherId) {
        const userRef = doc(db, "users", otherId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) otherUser = userSnap.data() as User;
      }
      return { ...data, otherUser };
    }));
    callback(conversations);
  });
};

// --- User Profile Services ---

export const updateUserProfile = async (uid: string, updates: Partial<User>): Promise<void> => {
  if (isMock) {
    if (mockUsers[uid]) {
      mockUsers[uid] = { ...mockUsers[uid], ...updates };
    }
    return;
  }

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, updates);
  } else {
    await updateDoc(userRef, updates);
  }
};

export const deleteUserAccount = async (uid: string): Promise<void> => {
  if (isMock) {
    delete mockUsers[uid];
    // Also remove items created by this user
    mockStore = mockStore.filter(item => item.userId !== uid);
    return;
  }

  // delete the user document
  await deleteDoc(doc(db, "users", uid));
  // Note: in a real app, delete user reports as well via Cloud Functions or recursive delete
};

