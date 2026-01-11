// In a real app, these would come from process.env
// The prompt specifies assuming process.env.API_KEY is available.

export const APP_NAME = "CampusFind";

export const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Keys",
  "Wallet/Purse",
  "ID/Cards",
  "Books/Notes",
  "Accessories",
  "Other"
];

// Fallback image if upload fails or for placeholders
export const PLACEHOLDER_IMG = "https://picsum.photos/400/300";

// Mock Data for initial state
export const MOCK_ITEMS: any[] = [
  {
    id: '1',
    type: 'lost',
    title: 'MacBook Pro Charger',
    description: 'White USB-C charger, left in the library quiet zone.',
    category: 'Electronics',
    location: { lat: 37.7749, lng: -122.4194 },
    locationName: 'Main Library, 3rd Floor',
    date: new Date(Date.now() - 86400000).toISOString(),
    status: 'open',
    imageUrl: 'https://picsum.photos/id/1/400/300',
    userId: 'user1'
  },
  {
    id: '2',
    type: 'found',
    title: 'Blue Hydroflask',
    description: 'Dark blue water bottle with sticker bombing.',
    category: 'Accessories',
    location: { lat: 37.7750, lng: -122.4180 },
    locationName: 'Science Center Hallway',
    date: new Date(Date.now() - 172800000).toISOString(),
    status: 'open',
    imageUrl: 'https://picsum.photos/id/2/400/300',
    userId: 'user2'
  }
];
