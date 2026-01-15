import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ReportForm from './components/ReportForm';
import MapContainer from './components/MapContainer';
import Messenger from './components/Messenger';
import ProfileModal from './components/ProfileModal';
import { LostFoundItem, User } from './types';
import { loginWithGoogle, onAuthChange, createItem, deleteItem, getOrCreateConversation } from './services/firebase';
import { X, Trash2, MessageCircle, Loader2 } from 'lucide-react';

// Use a simple view-based router since we are in a single-file environment primarily
// and HashRouter was suggested but view-state is often cleaner for modal flows in this context.

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, report
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);
  const [activeConvoId, setActiveConvoId] = useState<string | undefined>(undefined);
  const [showProfile, setShowProfile] = useState(false);
  const [myItemsOnly, setMyItemsOnly] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

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

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setDeleting(true);
    try {
      await deleteItem(itemId);
      setSelectedItem(null);
      setRefreshKey(prev => prev + 1);
    } catch (e) {
      console.error("Delete failed", e);
      alert("Failed to delete item.");
    } finally {
      setDeleting(false);
    }
  };

  const handleStartChat = async (recipientId: string) => {
    if (!user) {
      handleLogin();
      return;
    }

    if (user.uid === recipientId) {
      alert("You can't message yourself.");
      return;
    }

    setChatLoading(true);
    try {
      const convoId = await getOrCreateConversation([user.uid, recipientId]);
      setActiveConvoId(convoId);
      setShowMessenger(true);
      setSelectedItem(null); // Close the detail modal
    } catch (e) {
      console.error("Start chat failed", e);
      alert("Failed to start chat.");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        currentView={currentView}
        setView={setCurrentView}
        onOpenMessenger={() => setShowMessenger(true)}
        onOpenProfile={() => setShowProfile(true)}
      />

      <main className="relative">
        {currentView === 'dashboard' && (
          <Dashboard
            onItemClick={setSelectedItem}
            user={user}
            refreshKey={refreshKey}
            userIdFilter={myItemsOnly && user ? user.uid : null}
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
                  type="button"
                  aria-label="Close item details"
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 backdrop-blur text-white p-2 rounded-full transition"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${selectedItem.type === 'lost' ? 'bg-red-500 text-white' : 'bg-campus-600 text-white'
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

                {/* Map Preview (TomTom) */}
                <div className="h-40 rounded-xl overflow-hidden border border-gray-200 mb-6 relative">
                  <MapContainer
                    location={selectedItem.location}
                    interactive={false}
                  />
                </div>

                {(!user || user.uid !== selectedItem.userId) && (
                  <button
                    onClick={() => handleStartChat(selectedItem.userId)}
                    disabled={chatLoading}
                    className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-transform active:scale-[0.98] flex items-center justify-center space-x-2 disabled:bg-gray-400"
                  >
                    {chatLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <MessageCircle size={20} />
                    )}
                    <span>{chatLoading ? 'Starting Chat...' : `Contact ${selectedItem.type === 'lost' ? 'Owner' : 'Finder'}`}</span>
                  </button>
                )}

                {user && user.uid === selectedItem.userId && (
                  <button
                    onClick={() => handleDeleteItem(selectedItem.id)}
                    disabled={deleting}
                    className="w-full mt-3 py-3.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Trash2 size={18} />
                    <span>{deleting ? 'Deleting...' : 'Delete My Post'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {showMessenger && user && (
          <Messenger
            currentUser={user}
            onClose={() => setShowMessenger(false)}
            initialConversationId={activeConvoId}
          />
        )}

        {showProfile && user && (
          <ProfileModal
            user={user}
            onClose={() => setShowProfile(false)}
            onLogout={handleLogout}
            onUpdateUser={(updates) => setUser({ ...user, ...updates })}
            onViewMyItems={() => {
              setMyItemsOnly(true);
              setCurrentView('dashboard');
            }}
          />
        )}
      </main>
    </div>
  );
};

export default App;
