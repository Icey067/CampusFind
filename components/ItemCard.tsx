import React from 'react';
import { LostFoundItem } from '../types';
import { MapPin, Calendar, Tag, CheckCircle } from 'lucide-react';

interface ItemCardProps {
  item: LostFoundItem;
  onClick: (item: LostFoundItem) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  const isLost = item.type === 'lost';
  
  return (
    <div 
      onClick={() => onClick(item)}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
    >
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        <img 
          src={item.imageUrl || "https://picsum.photos/400/300"} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
            isLost 
              ? 'bg-red-50 text-red-600 border border-red-100' 
              : 'bg-green-50 text-green-600 border border-green-100'
          }`}>
            {item.type}
          </span>
        </div>
        {item.status === 'resolved' && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-full font-medium shadow-lg">
              <CheckCircle size={16} />
              <span>Resolved</span>
            </span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-1 group-hover:text-campus-600 transition-colors">
            {item.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2 h-10">
            {item.description}
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-50">
          <div className="flex items-center text-xs text-gray-500">
            <MapPin size={14} className="mr-1.5 text-campus-500" />
            <span className="truncate">{item.locationName || "Unknown location"}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-400">
              <Calendar size={14} className="mr-1.5" />
              <span>{new Date(item.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
              <Tag size={12} className="mr-1" />
              <span>{item.category}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
