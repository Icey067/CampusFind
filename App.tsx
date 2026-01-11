import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ReportForm from './components/ReportForm';
import { LostFoundItem, User } from './types';
import { loginWithGoogle, createItem } from './services/firebase';
import { X } from 'lucide-react';

// Use a simple view-based router since we are in a single-file environment primarily
// and HashRouter was suggested but view-state is often cleaner for modal flows in this context.

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, report
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);

  const handleLogin = async () => {
    try {
      const u = await loginWithGoogle();
      setUser(u);
    } catch (e) {
      console.error("Login failed", e);
      alert("Login failed (Mock or Config Error)");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
  };

  const handleSubmitReport = async (item: Omit<LostFoundItem, 'id'>) => {
    await createItem(item);
    setCurrentView('dashboard');
    // In a real app, trigger a toast notification here
  };

  const handleCancelReport = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navbar 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        currentView={currentView}
        setView={setCurrentView}
      />

      <main className="relative">
        {currentView === 'dashboard' && (
          <Dashboard 
            onItemClick={setSelectedItem} 
            user={user} 
          />
        )}

        {/* Modal-style Report Form */}
        {currentView === 'report' && (
          <div className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-0 md:p-4">
            {user ? (
               <ReportForm 
                 userId={user.uid} 
                 onSubmit={handleSubmitReport} 
                 onCancel={handleCancelReport} 
               />
            ) : (
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm text-center">
                <h3 className="text-xl font-bold mb-2">Login Required</h3>
                <p className="text-gray-500 mb-6">You must be logged in to report a lost or found item.</p>
                <div className="space-y-3">
                  <button 
                    onClick={handleLogin} 
                    className="w-full py-3 bg-campus-600 text-white rounded-xl font-semibold hover:bg-campus-700 transition"
                  >
                    Log In with Google
                  </button>
                  <button 
                    onClick={() => setCurrentView('dashboard')} 
                    className="w-full py-3 text-gray-500 hover:bg-gray-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Item Detail Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
            <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="relative h-64 bg-gray-100">
                <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-full h-full object-cover" />
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 backdrop-blur text-white p-2 rounded-full transition"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                    selectedItem.type === 'lost' ? 'bg-red-500 text-white' : 'bg-campus-600 text-white'
                  }`}>
                    {selectedItem.type.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-2">{selectedItem.title}</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                  <span>{new Date(selectedItem.date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{selectedItem.locationName}</span>
                </div>
                
                <div className="prose prose-sm text-gray-600 mb-6">
                  <p>{selectedItem.description}</p>
                </div>

                {/* Map Preview (Static-ish) */}
                <div className="h-40 rounded-xl overflow-hidden border border-gray-200 mb-6 relative">
                   {/* We reuse the interactive map but disable interaction for detail view if we wanted, 
                       for now just showing a map centered on item */}
                   <iframe
                     width="100%"
                     height="100%"
                     style={{ border: 0 }}
                     loading="lazy"
                     allowFullScreen
                     referrerPolicy="no-referrer-when-downgrade"
                     src={`https://www.google.com/maps/embed/v1/place?key=${process.env.API_KEY || ''}&q=${selectedItem.location.lat},${selectedItem.location.lng}&zoom=16`}
                    ></iframe>
                     {/* Fallback overlay if no key */}
                     <div className="absolute inset-0 bg-gray-100/10 pointer-events-none" />
                </div>

                <button className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-transform active:scale-[0.98]">
                   Contact {selectedItem.type === 'lost' ? 'Owner' : 'Finder'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
