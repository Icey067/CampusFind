import React, { useState } from 'react';
import { User, LostFoundItem } from '../types';
import { updateUserProfile, deleteUserAccount } from '../services/firebase';
import { X, User as UserIcon, LogOut, Trash2, Check, Edit2, Package, Search } from 'lucide-react';

interface ProfileModalProps {
    user: User;
    onClose: () => void;
    onLogout: () => void;
    onUpdateUser: (updates: Partial<User>) => void;
    onViewMyItems: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onLogout, onUpdateUser, onViewMyItems }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(user.displayName || '');
    const [updating, setUpdating] = useState(false);

    const handleUpdateName = async () => {
        if (!newName.trim() || newName === user.displayName) {
            setIsEditing(false);
            return;
        }

        setUpdating(true);
        try {
            await updateUserProfile(user.uid, { displayName: newName });
            onUpdateUser({ displayName: newName });
            setIsEditing(false);
        } catch (e) {
            console.error("Failed to update name", e);
            alert("Failed to update name.");
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("Are you sure you want to delete your account? This will remove all your posts and cannot be undone.")) return;

        try {
            await deleteUserAccount(user.uid);
            onLogout();
            onClose();
        } catch (e) {
            console.error("Failed to delete account", e);
            alert("Failed to delete account.");
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="relative h-32 bg-campus-600 flex items-center justify-center">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition"
                    >
                        <X size={20} />
                    </button>
                    <div className="absolute -bottom-10 w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-campus-50 text-campus-600">
                                <UserIcon size={40} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="pt-14 pb-8 px-8 text-center">
                    <div className="mb-8">
                        {isEditing ? (
                            <div className="flex items-center justify-center space-x-2">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    autoFocus
                                    className="text-xl font-bold text-center border-b-2 border-campus-500 outline-none px-2 py-1 w-full max-w-[200px]"
                                />
                                <button
                                    onClick={handleUpdateName}
                                    disabled={updating}
                                    className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                >
                                    <Check size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center space-x-2 group">
                                <h2 className="text-2xl font-bold text-gray-900">{user.displayName || 'Campus User'}</h2>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-1 text-gray-400 hover:text-campus-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        )}
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 mb-8">
                        <button
                            onClick={() => {
                                onViewMyItems();
                                onClose();
                            }}
                            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all group"
                        >
                            <div className="flex items-center space-x-3 text-gray-700">
                                <Package size={20} className="text-campus-600" />
                                <span className="font-semibold text-sm">View My Reports</span>
                            </div>
                            <Search size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={onLogout}
                            className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-transform active:scale-[0.98] flex items-center justify-center space-x-2"
                        >
                            <LogOut size={18} />
                            <span>Log Out</span>
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            className="w-full py-3.5 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center space-x-2"
                        >
                            <Trash2 size={18} />
                            <span>Delete Account</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
