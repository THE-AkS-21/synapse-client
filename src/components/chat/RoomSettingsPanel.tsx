'use client';

import { useState, useRef, useEffect } from 'react';
import { Copy, Trash2, UserPlus, X, AlertTriangle, MessageSquareX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/api';
import { useChatStore, Room } from '@/store/chatStore';
import toast from 'react-hot-toast';

interface Props {
    room: Room;
    isCreator: boolean;
    isPrivate: boolean;
    onClose: () => void;
}

export default function RoomSettingsPanel({ room, isCreator, isPrivate, onClose }: Props) {
    const { setRooms, rooms, setActiveRoom } = useChatStore();
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [confirmClear, setConfirmClear] = useState(false);
    const [inviteId, setInviteId] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const isDM = room.type === 'DIRECT';
    const displayId = isDM ? (room as any).dmPartnerDisplayId || room.id : room.id;
    const displayName = isDM ? `@${room.dmPartner}` : room.name;

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const handleCopy = () => {
        navigator.clipboard.writeText(displayId);
        toast.success(`${isDM ? 'Unique ID' : 'Room ID'} copied!`, { icon: '📋' });
    };

    const handleClearMessages = async () => {
        setIsClearing(true);
        try {
            await api.delete(`/api/v1/rooms/${room.id}/messages`);
            // CRITICAL FIX: Instantly clear the messages in React state to avoid needing a refresh
            useChatStore.getState().setMessages(room.id, []);
            toast.success('All messages cleared.');
            onClose();
        } catch (err: any) {
            const data = err?.response?.data;
            toast.error(data?.message || (typeof data === 'string' ? data : 'Failed to clear messages.'));
        } finally {
            setIsClearing(false);
            setConfirmClear(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/api/v1/rooms/${room.id}`);
            setRooms(rooms.filter(r => r.id !== room.id));
            setActiveRoom(null);
            toast.success(`${isDM ? 'Chat' : 'Room'} deleted.`);
            onClose();
        } catch (err: any) {
            const data = err?.response?.data;
            toast.error(data?.message || (typeof data === 'string' ? data : `Failed to delete ${isDM ? 'chat' : 'room'}.`));
        } finally {
            setIsDeleting(false);
            setConfirmDelete(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        const id = inviteId.trim().toUpperCase();
        if (!id) return;
        setIsInviting(true);
        try {
            await api.post(`/api/v1/invitations/room/${room.id}/invite`, null, {
                params: { targetDisplayId: id }
            });
            toast.success(`Invitation sent!`);
            setInviteId('');
        } catch (err: any) {
            const data = err?.response?.data;
            const msg = data?.message || (typeof data === 'string' ? data : 'Failed to send invitation.');
            toast.error(msg);
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-16 left-0 z-50 w-80 rounded-2xl shadow-2xl border overflow-hidden"
            style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)' }}
        >
            {/* Same UI structure as before... */}
            <div className="flex items-center justify-between px-4 py-3 border-b"
                 style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                        {isDM ? 'User Details' : 'Room Settings'}
                    </span>
                    <span className="text-xs truncate max-w-[120px] font-mono" style={{ color: 'var(--foreground)', opacity: 0.4 }}>
                        {displayName}
                    </span>
                </div>
                <button onClick={onClose} className="p-1 rounded-lg transition-colors"
                        style={{ color: 'var(--foreground)', opacity: 0.5 }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.opacity = '0.5'; }}>
                    <X size={14} />
                </button>
            </div>

            <div className="p-4 space-y-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--foreground)', opacity: 0.4 }}>
                        {isDM ? `${room.dmPartner}'s Unique ID` : 'Room ID'}
                    </p>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer group"
                         style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                         onClick={handleCopy}
                    >
                        <span className="font-mono text-sm flex-1" style={{ color: 'var(--foreground)' }}>{displayId}</span>
                        <Copy size={13} style={{ color: 'var(--brand)' }} />
                    </div>
                </div>

                {isCreator && !isDM && (
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--foreground)', opacity: 0.4 }}>
                            Invite Member {isPrivate ? '' : '(by User ID)'}
                        </p>
                        <form onSubmit={handleInvite} className="flex gap-2">
                            <input
                                value={inviteId}
                                onChange={e => setInviteId(e.target.value)}
                                placeholder="XXXX-XXXX-XXXX"
                                maxLength={14}
                                className="flex-1 px-3 py-2 text-sm rounded-xl border focus:outline-none font-mono"
                                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                            />
                            <button type="submit" disabled={isInviting || !inviteId.trim()}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
                                    style={{ background: 'var(--brand)' }}>
                                <UserPlus size={13} />
                            </button>
                        </form>
                    </div>
                )}

                {(isCreator || isDM) && (
                    <div className="border-t pt-3 space-y-2" style={{ borderColor: 'var(--border)' }}>
                        <AnimatePresence mode="wait">
                            {!confirmClear ? (
                                <motion.button key="clear-btn"
                                               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                               onClick={() => setConfirmClear(true)}
                                               className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-medium transition-colors"
                                               style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                                    <MessageSquareX size={13} /> Clear All Messages
                                </motion.button>
                            ) : (
                                <motion.div key="confirm-clear"
                                            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="rounded-xl p-3 border"
                                            style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                                    <p className="text-xs mb-2.5 text-center" style={{ color: 'var(--foreground)' }}>
                                        Clear all messages for everyone?
                                    </p>
                                    <div className="flex gap-2">
                                        <button onClick={() => setConfirmClear(false)}
                                                className="flex-1 py-1.5 text-xs rounded-lg border"
                                                style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}>
                                            Cancel
                                        </button>
                                        <button onClick={handleClearMessages} disabled={isClearing}
                                                className="flex-1 py-1.5 text-xs text-white rounded-lg font-semibold disabled:opacity-60"
                                                style={{ background: 'var(--brand)' }}>
                                            {isClearing ? '...' : 'Clear'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence mode="wait">
                            {!confirmDelete ? (
                                <motion.button key="del-btn"
                                               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                               onClick={() => setConfirmDelete(true)}
                                               className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-medium transition-colors hover:bg-red-500/10"
                                               style={{ borderColor: 'rgba(239,68,68,0.3)', color: 'rgb(248,113,113)' }}>
                                    <Trash2 size={13} /> Delete {isDM ? 'Chat' : 'Room'}
                                </motion.button>
                            ) : (
                                <motion.div key="confirm-del"
                                            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="rounded-xl p-3 border"
                                            style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.25)' }}>
                                    <div className="flex items-start gap-2 mb-2.5">
                                        <AlertTriangle size={13} className="text-red-400 mt-0.5 shrink-0" />
                                        <p className="text-xs text-red-300">Delete <strong>{displayName}</strong>? This cannot be undone.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setConfirmDelete(false)}
                                                className="flex-1 py-1.5 text-xs rounded-lg border transition-colors"
                                                style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}>
                                            Cancel
                                        </button>
                                        <button onClick={handleDelete} disabled={isDeleting}
                                                className="flex-1 py-1.5 text-xs text-white bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors disabled:opacity-60">
                                            {isDeleting ? '...' : 'Delete'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.div>
    );
}