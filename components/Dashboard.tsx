import React, { useState, useEffect } from 'react';
import { fetchItems } from '../services/firebase';
import { findSmartMatches } from '../services/geminiService';
import { LostFoundItem, User } from '../types';
import ItemCard from './ItemCard';
import { CATEGORIES } from '../constants';
import { Filter, Loader2, Sparkles } from 'lucide-react';

interface DashboardProps {
  onItemClick: (item: LostFoundItem) => void;
  user: User | null;
  refreshKey?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onItemClick, user, refreshKey }) => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Placeholder for real-time item matching notifications
  // In production, this would subscribe to a websocket or cloud function
  const [matches, setMatches] = useState<string[]>([]);

  useEffect(() => {
    loadItems();
  }, [refreshKey]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (error) {
      console.error("Failed to load items:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterCategory !== 'All' && item.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="pb-24 pt-20 px-4 md:px-8 max-w-7xl mx-auto">

      {/* Feed Header */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Recent Activity</h1>
            <p className="text-gray-500">Helping the community find what was lost.</p>
          </div>

          <div className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-gray-200 w-fit">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterType === 'all' ? 'bg-gray-900 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('lost')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterType === 'lost' ? 'bg-red-500 text-white shadow' : 'text-gray-600 hover:bg-red-50'}`}
            >
              Lost
            </button>
            <button
              onClick={() => setFilterType('found')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterType === 'found' ? 'bg-campus-600 text-white shadow' : 'text-gray-600 hover:bg-campus-50'}`}
            >
              Found
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
          <Filter size={16} className="text-gray-400 flex-shrink-0" />
          <button
            onClick={() => setFilterCategory('All')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterCategory === 'All' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
          >
            All Categories
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterCategory === cat ? 'bg-campus-600 text-white border-campus-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 size={32} className="animate-spin text-campus-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div key={item.id}>
              <ItemCard item={item} onClick={onItemClick} />
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Filter size={32} />
              </div>
              <p>No items found matching your filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
