import { LostFoundItem } from '../types';

const API_BASE_URL = `http://${window.location.hostname}:3001/api`;

export const fetchItems = async (): Promise<LostFoundItem[]> => {
    const response = await fetch(`${API_BASE_URL}/items`);
    if (!response.ok) {
        throw new Error('Failed to fetch items');
    }
    return response.json();
};

export const createItem = async (item: Omit<LostFoundItem, 'id'>): Promise<LostFoundItem> => {
    const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
    });
    if (!response.ok) {
        throw new Error('Failed to create item');
    }
    return response.json();
};

export const uploadImage = async (base64Data: string): Promise<string> => {
    // For now, we'll just return the base64 data as the URL for simplicity,
    // or we could implement a real upload endpoint.
    // Given the "make the backend" request, let's keep it simple.
    return base64Data;
};
