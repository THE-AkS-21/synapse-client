'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Lock, KeyRound, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Avatar } from '@/components/ui/Avatar';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'profile' | 'password';

export default function UserProfileModal({ isOpen, onClose }: Props) {
    const user = useAuthStore(state => state.user);
    const setAuth = useAuthStore(state => state.setAuth);
    const token = useAuthStore(state => state.token);

    const [tab, setTab] = useState<Tab>('profile');
    const [newUsername, setNewUsername] = useState(user?.username || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoadingUsername, setIsLoadingUsername] = useState(false);
    const [isLoadingPassword, setIsLoadingPassword] = useState(false);

    const handleUpdateUsername = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUsername.trim() || newUsername === user?.username) return;
        setIsLoadingUsername(true);
        try {
            await api.put('/api/v1/users/me/username', { username: newUsername.trim() });
            // Update local auth store
            if (user && token) {
                setAuth({ ...user, username: newUsername.trim() }, token);
            }
            toast.success('Username updated!');
            onClose();
        } catch (err: unknown) {
            const e = err as { response?: { data?: unknown } };
            const msg = e.response?.data;
            toast.error(typeof msg === 'string' ? msg : 'Failed to update username.');
        } finally {
            setIsLoadingUsername(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword) return;
        if (newPassword.length < 6) { toast.error('New password must be at least 6 characters.'); return; }
        setIsLoadingPassword(true);
        try {
            await api.put('/api/v1/users/me/password', { currentPassword, newPassword });
            toast.success('Password updated!');
            setCurrentPassword('');
            setNewPassword('');
            onClose();
        } catch (err: unknown) {
            const e = err as { response?: { data?: unknown } };
            const msg = e.response?.data;
            toast.error(typeof msg === 'string' ? msg : 'Failed to update password. Check your current password.');
        } finally {
            setIsLoadingPassword(false);
        }
    };

    if (!user) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-hover">
                            <h2 className="text-base font-semibold text-foreground">My Profile</h2>
                            <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-foreground hover:bg-surface-elevated transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Avatar + identity */}
                        <div className="px-6 pt-6 pb-4 border-b border-border flex flex-col items-center text-center bg-surface-elevated/40">
                            <Avatar name={user.username} size="lg" />
                            <h3 className="mt-3 text-lg font-heading font-semibold text-foreground">{user.username}</h3>
                            <p className="text-xs text-zinc-500 mt-0.5">{user.email}</p>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-border">
                            {(['profile', 'password'] as Tab[]).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === t
                                            ? 'text-brand border-b-2 border-brand'
                                            : 'text-zinc-500 hover:text-foreground'
                                        }`}
                                >
                                    {t === 'profile' ? 'Update Username' : 'Change Password'}
                                </button>
                            ))}
                        </div>

                        {/* Tab content */}
                        <div className="p-5">
                            {tab === 'profile' && (
                                <form onSubmit={handleUpdateUsername} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">New Username</label>
                                        <Input
                                            type="text"
                                            placeholder="Enter new username"
                                            value={newUsername}
                                            onChange={(e) => setNewUsername(e.target.value)}
                                            icon={<UserIcon size={16} />}
                                            required
                                            minLength={3}
                                        />
                                        <p className="text-xs text-zinc-500">Must be at least 3 characters.</p>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-1">
                                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                                        <Button type="submit" isLoading={isLoadingUsername}
                                            disabled={!newUsername.trim() || newUsername === user.username || newUsername.length < 3}>
                                            <CheckCircle2 size={14} className="mr-1" />
                                            Save Username
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {tab === 'password' && (
                                <form onSubmit={handleUpdatePassword} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Current Password</label>
                                        <Input type="password" placeholder="Enter your current password"
                                            value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                                            icon={<Lock size={16} />} required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">New Password</label>
                                        <Input type="password" placeholder="Enter a new password"
                                            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                            icon={<KeyRound size={16} />} required />
                                        <p className="text-xs text-zinc-500">Must be at least 6 characters.</p>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-1">
                                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                                        <Button type="submit" isLoading={isLoadingPassword}
                                            disabled={!currentPassword || !newPassword || newPassword.length < 6}>
                                            Save Password
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
