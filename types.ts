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
