import React, { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon, X, ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
import { User, Message, Conversation } from '../types';
import { sendMessage, subscribeToMessages, subscribeToConversations } from '../services/firebase';

interface MessengerProps {
    currentUser: User;
    onClose: () => void;
    initialConversationId?: string;
}

const Messenger: React.FC<MessengerProps> = ({ currentUser, onClose, initialConversationId }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showConvoList, setShowConvoList] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = subscribeToConversations(currentUser.uid, (convos) => {
            setConversations(convos);
            setLoading(false);

            if (initialConversationId && !selectedConvo) {
                const initial = convos.find(c => c.id === initialConversationId);
                if (initial) {
                    setSelectedConvo(initial);
                    setShowConvoList(false);
                }
            }
        });
        return () => unsubscribe();
    }, [currentUser.uid, initialConversationId]);

    useEffect(() => {
        if (selectedConvo) {
            const unsubscribe = subscribeToMessages(selectedConvo.id, (msgs) => {
                setMessages(msgs);
                scrollToBottom();
            });
            return () => unsubscribe();
        }
    }, [selectedConvo]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedConvo || !newMessage.trim()) return;

        const otherId = selectedConvo.participants.find(id => id !== currentUser.uid);
        if (!otherId) return;

        const msg = newMessage;
        setNewMessage('');

        try {
            await sendMessage(selectedConvo.id, {
                senderId: currentUser.uid,
                recipientId: otherId,
                text: msg
            });
        } catch (err) {
            console.error("Failed to send", err);
            setNewMessage(msg); // Restore if failed
        }
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return '';
        try {
            return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white md:m-4 md:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-white shadow-sm z-10">
                <div className="flex items-center space-x-3">
                    {!showConvoList && (
                        <button
                            onClick={() => setShowConvoList(true)}
                            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <h2 className="text-xl font-bold text-gray-900">
                        {showConvoList ? 'Messages' : selectedConvo?.otherUser?.displayName || 'Chat'}
                    </h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Conversation List */}
                <div className={`w-full md:w-80 border-r bg-gray-50/50 flex flex-col ${!showConvoList ? 'hidden md:flex' : 'flex'}`}>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 size={32} className="animate-spin text-campus-600" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400">
                                <MessageCircle size={48} className="mb-4 opacity-20" />
                                <p>No conversations yet.</p>
                                <p className="text-xs">Start a chat from an item post!</p>
                            </div>
                        ) : (
                            conversations.map(convo => (
                                <button
                                    key={convo.id}
                                    onClick={() => {
                                        setSelectedConvo(convo);
                                        setShowConvoList(false);
                                    }}
                                    className={`w-full p-4 rounded-2xl flex items-center space-x-3 transition-all ${selectedConvo?.id === convo.id ? 'bg-white shadow-md ring-1 ring-campus-200' : 'hover:bg-white/80'}`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-campus-100 flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                        {convo.otherUser?.photoURL ? (
                                            <img src={convo.otherUser.photoURL} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon size={24} className="text-campus-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-bold text-gray-900 truncate">{convo.otherUser?.displayName || 'Anonymous'}</h3>
                                            <span className="text-[10px] text-gray-400 font-medium">{formatTime(convo.updatedAt)}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                            {convo.lastMessage ? (
                                                <span>{convo.lastMessage.senderId === currentUser.uid ? 'You: ' : ''}{convo.lastMessage.text}</span>
                                            ) : (
                                                "No messages yet"
                                            )}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat window */}
                <div className={`flex-1 flex flex-col bg-white ${showConvoList ? 'hidden md:flex' : 'flex'}`}>
                    {selectedConvo ? (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.senderId === currentUser.uid
                                                ? 'bg-campus-600 text-white rounded-tr-none'
                                                : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                            }`}>
                                            <p>{msg.text}</p>
                                            <p className={`text-[10px] mt-1 text-right opacity-60`}>
                                                {formatTime(msg.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 border-t bg-gray-50/50 backdrop-blur">
                                <form onSubmit={handleSendMessage} className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-campus-200 bg-white"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="p-3 bg-campus-600 text-white rounded-xl hover:bg-campus-700 disabled:bg-gray-300 transition-all shadow-lg shadow-campus-500/20 active:scale-95"
                                    >
                                        <Send size={20} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <MessageCircle size={32} className="opacity-20" />
                            </div>
                            <h3 className="font-bold text-gray-900">Select a Conversation</h3>
                            <p className="text-sm max-w-xs mt-1 text-gray-500">Choose a chat from the list to start messaging with other students.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messenger;
