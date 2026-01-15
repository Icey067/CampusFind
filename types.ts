export type ItemType = 'lost' | 'found';

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface LostFoundItem {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  location: GeoLocation;
  locationName?: string;
  date: string;
  status: 'open' | 'resolved';
  userId: string;
  keywords?: string[]; // For AI matching
}

export interface User {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
}

export interface AIAnalysisResult {
  title: string;
  description: string;
  category: string;
  keywords: string[];
}
export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: string;
  read: boolean;
  itemId?: string; // Optional reference to the item being discussed
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
  otherUser?: User; // Dynamically populated user info
}
