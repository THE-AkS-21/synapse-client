'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Lock, KeyRound, User as UserIcon, CheckCircle2, Copy, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Avatar } from '@/components/ui/Avatar';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'profile' | 'password';

// Helper to gracefully extract Spring Boot validation errors
const extractErrorMessage = (err: any, fallback: string): string => {
    const data = err?.response?.data;
    if (Array.isArray(data) && data.length > 0) return data[0];
    if (typeof data === 'string') return data;
    if (data?.message) return data.message;
    return fallback;
};

export default function UserProfileModal({ isOpen, onClose }: Props) {
    const { user, setAuth, token } = useAuthStore();

    const [tab, setTab] = useState<Tab>('profile');
    const [displayId, setDisplayId] = useState<string | null>(null);

    const [newUsername, setNewUsername] = useState(user?.username || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // Added for UX safety

    const [isLoadingUsername, setIsLoadingUsername] = useState(false);
    const [isLoadingPassword, setIsLoadingPassword] = useState(false);

    // Escape Key Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Fetch Public Display ID when modal opens
    useEffect(() => {
        if (!isOpen) return;
        api.get('/api/v1/users/me')
            .then(res => setDisplayId(res.data?.displayId || null))
            .catch(() => setDisplayId(null));
    }, [isOpen]);

    const handleUpdateUsername = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedUsername = newUsername.trim();

        if (!trimmedUsername || trimmedUsername === user?.username) return;

        setIsLoadingUsername(true);
        try {
            await api.put('/api/v1/users/me/username', { username: trimmedUsername });
            if (user && token) {
                setAuth({ ...user, username: trimmedUsername }, token);
            }
            toast.success('Username updated successfully!');
            onClose();
        } catch (err: any) {
            toast.error(extractErrorMessage(err, 'Failed to update username.'));
        } finally {
            setIsLoadingUsername(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword) return;

        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match.');
            return;
        }

        setIsLoadingPassword(true);
        try {
            await api.put('/api/v1/users/me/password', { currentPassword, newPassword });
            toast.success('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            onClose();
        } catch (err: any) {
            toast.error(extractErrorMessage(err, 'Failed to update password. Check your current password.'));
        } finally {
            setIsLoadingPassword(false);
        }
    };

    if (!user || !isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <AnimatePresence mode="wait">
                <motion.div
                    key="profile-modal"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-hover">
                        <h2 className="text-base font-semibold text-foreground">My Profile</h2>
                        <button
                            onClick={onClose}
                            aria-label="Close profile modal"
                            className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-surface-elevated transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Avatar & Display ID */}
                    <div className="px-6 pt-6 pb-4 border-b border-border flex flex-col items-center text-center bg-surface-elevated">
                        <Avatar name={user.username} size="lg" />
                        <h3 className="mt-3 text-lg font-heading font-semibold text-foreground">{user.username}</h3>
                        <p className="text-xs mt-0.5 text-foreground/50">{user.email}</p>

                        {displayId && (
                            <div className="mt-4 w-full max-w-xs">
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-foreground/40">
                                    <Fingerprint size={9} className="inline mr-1" />Your User ID
                                </p>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(displayId);
                                        toast.success('User ID copied!', { icon: '📋' });
                                    }}
                                    className="flex items-center justify-between gap-2 w-full px-3 py-2.5 rounded-xl border border-border bg-surface font-mono text-sm transition-all group hover:border-brand/30 text-foreground"
                                >
                                    <span>{displayId}</span>
                                    <Copy size={13} className="text-brand opacity-60 group-hover:opacity-100 transition-opacity" />
                                </button>
                                <p className="text-[10px] mt-1.5 text-foreground/40">
                                    Share this ID to receive private room invitations.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex border-b border-border bg-surface">
                        {(['profile', 'password'] as Tab[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === t
                                    ? 'text-brand border-b-2 border-brand bg-brand/5'
                                    : 'text-foreground/60 hover:text-foreground hover:bg-surface-hover'
                                }`}
                            >
                                {t === 'profile' ? 'Update Username' : 'Change Password'}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-5 bg-surface">
                        {tab === 'profile' && (
                            <form onSubmit={handleUpdateUsername} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">New Username</label>
                                    <Input
                                        type="text"
                                        placeholder="Enter new username"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        icon={<UserIcon size={16} />}
                                        required
                                        minLength={3}
                                    />
                                    <p className="text-xs text-foreground/50">Must be at least 3 characters.</p>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                                    <Button type="submit" isLoading={isLoadingUsername}
                                            disabled={!newUsername.trim() || newUsername === user.username || newUsername.length < 3}>
                                        <CheckCircle2 size={14} className="mr-1.5" />
                                        Save Username
                                    </Button>
                                </div>
                            </form>
                        )}

                        {tab === 'password' && (
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Current Password</label>
                                    <Input type="password" placeholder="Enter your current password"
                                           value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                                           icon={<Lock size={16} />} required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">New Password</label>
                                    <Input type="password" placeholder="Enter a new password"
                                           value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                           icon={<KeyRound size={16} />} required minLength={6} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Confirm New Password</label>
                                    <Input type="password" placeholder="Re-enter new password"
                                           value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                           icon={<KeyRound size={16} />} required minLength={6} />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                                    <Button type="submit" isLoading={isLoadingPassword}
                                            disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}>
                                        Save Password
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );

    return createPortal(modalContent, document.body);
}