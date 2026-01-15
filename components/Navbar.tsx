import React from 'react';
import { User } from '../types';
import { LogOut, MapPin, PlusCircle, Search, User as UserIcon, MessageSquare } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  currentView: string;
  setView: (view: string) => void;
  onOpenMessenger: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogin, onLogout, onOpenProfile, currentView, setView, onOpenMessenger }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto z-50 bg-white/80 backdrop-blur-md border-t md:border-b border-gray-200 px-6 py-4 md:py-3 shadow-lg md:shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="hidden md:flex items-center space-x-2 cursor-pointer" onClick={() => setView('dashboard')}>
          <div className="bg-campus-600 text-white p-1.5 rounded-lg">
            <MapPin size={20} />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">CampusFind</span>
        </div>

        {/* Mobile Nav Links */}
        <div className="flex md:hidden w-full justify-between px-2">
          <button
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center space-y-1 ${currentView === 'dashboard' ? 'text-campus-600' : 'text-gray-400'}`}
          >
            <Search size={24} />
            <span className="text-[10px] font-medium">Explore</span>
          </button>

          <button
            onClick={onOpenMessenger}
            className={`flex flex-col items-center space-y-1 ${currentView === 'messages' ? 'text-campus-600' : 'text-gray-400'}`}
          >
            <div className="relative">
              <MessageSquare size={24} />
              {user && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-campus-600 border-2 border-white rounded-full"></span>
              )}
            </div>
            <span className="text-[10px] font-medium">Chat</span>
          </button>

          <button
            onClick={() => setView('report')}
            className="flex flex-col items-center space-y-1 -mt-8"
          >
            <div className="bg-campus-600 text-white p-4 rounded-full shadow-lg shadow-campus-500/30 transform active:scale-95 transition-all">
              <PlusCircle size={28} />
            </div>
            <span className="text-[10px] font-medium text-campus-600">Report</span>
          </button>

          <button
            onClick={user ? onOpenProfile : onLogin}
            className={`flex flex-col items-center space-y-1 ${currentView === 'profile' ? 'text-campus-600' : 'text-gray-400'}`}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-6 h-6 rounded-full border border-gray-200" />
            ) : (
              <UserIcon size={24} />
            )}
            <span className="text-[10px] font-medium">{user ? 'Profile' : 'Login'}</span>
          </button>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-6">
          <button
            onClick={() => setView('dashboard')}
            className={`text-sm font-medium hover:text-campus-600 transition-colors ${currentView === 'dashboard' ? 'text-campus-600' : 'text-gray-600'}`}
          >
            Feed
          </button>

          <button
            onClick={() => setView('report')}
            className="flex items-center space-x-2 bg-campus-600 hover:bg-campus-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg"
          >
            <PlusCircle size={18} />
            <span>Report Item</span>
          </button>

          <button
            onClick={onOpenMessenger}
            className="p-2 text-gray-400 hover:text-campus-600 transition-colors relative"
          >
            <MessageSquare size={22} />
            {user && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-campus-600 border-2 border-white rounded-full"></span>
            )}
          </button>

          {user ? (
            <div className="flex items-center space-x-3 border-l pl-4 border-gray-200">
              <button
                onClick={onOpenProfile}
                className="flex items-center space-x-2 group"
              >
                <img src={user.photoURL || ''} alt="User" className="w-8 h-8 rounded-full border border-gray-200 group-hover:ring-2 group-hover:ring-campus-500 transition-all" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-campus-600 transition-colors uppercase tracking-tight">{user.displayName || 'Me'}</span>
              </button>
            </div>
          ) : (
            <button onClick={onLogin} className="text-sm font-medium text-gray-600 hover:text-campus-600">
              Log In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
