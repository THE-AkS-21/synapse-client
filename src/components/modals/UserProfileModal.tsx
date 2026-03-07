'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Lock, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Avatar } from '@/components/ui/Avatar';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: Props) {
    const user = useAuthStore(state => state.user);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword) return;

        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters.");
            return;
        }

        setIsLoading(true);

        try {
            await api.put('/api/v1/users/me/password', {
                currentPassword,
                newPassword
            });
            toast.success("Password updated successfully!");
            setCurrentPassword('');
            setNewPassword('');
            onClose();
        } catch (err: any) {
            console.error('Failed to update password:', err);
            const msg = err.response?.data || "Failed to update password. Please check your current password.";
            toast.error(typeof msg === 'string' ? msg : "Failed to update password.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden glass transition-colors duration-300"
                    >
                        <div className="flex items-center justify-between p-5 border-b border-border bg-surface-hover">
                            <h2 className="text-lg font-semibold text-foreground">My Profile</h2>
                            <button onClick={onClose} className="p-1 rounded-md text-zinc-500 hover:text-foreground hover:bg-surface-elevated transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 border-b border-border flex flex-col items-center justify-center text-center bg-surface-elevated/50">
                            <Avatar name={user.username} size="lg" />
                            <h3 className="mt-3 text-xl font-heading font-semibold text-foreground">{user.username}</h3>
                            <p className="text-sm text-zinc-500 mt-1">Manage your account settings</p>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="p-5 space-y-5">
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-foreground">Update Password</h4>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                        Current Password
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder="Enter your current password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        icon={<Lock size={18} />}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                        New Password
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder="Enter a new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        icon={<KeyRound size={18} />}
                                        required
                                    />
                                    <p className="text-xs text-zinc-500">
                                        Must be at least 6 characters long.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="ghost" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" isLoading={isLoading} disabled={!currentPassword || !newPassword || newPassword.length < 6}>
                                    Save Password
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
