'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, X, MessageCircle, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/api';
import { useChatStore } from '@/store/chatStore';
import toast from 'react-hot-toast';

interface Invitation {
    id: number;
    type: 'ROOM' | 'DM';
    fromUsername: string;
    roomId?: string;
    roomName?: string;
    createdAt: string;
}

export default function NotificationBell() {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
    const [mounted, setMounted] = useState(false);
    const bellRef = useRef<HTMLButtonElement>(null);
    const { setRooms, setActiveRoom } = useChatStore();

    // Only render portal after hydration
    useEffect(() => { setMounted(true); }, []);

    const fetchPending = async () => {
        try {
            setIsFetching(true);
            const res = await api.get('/api/v1/invitations/pending');
            setInvitations(res.data || []);
        } catch {
            // silently ignore
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchPending();
        const interval = setInterval(fetchPending, 30_000);
        return () => clearInterval(interval);
    }, []);

    const openPanel = () => {
        if (bellRef.current) {
            const rect = bellRef.current.getBoundingClientRect();
            // Position to the right of bell if near left edge, else left-align
            setPanelPos({ top: rect.bottom + 8, left: Math.max(8, rect.left) });
        }
        setIsOpen(v => !v);
        if (!isOpen) fetchPending();
    };

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handle = (e: MouseEvent) => {
            const panel = document.getElementById('notification-panel-root');
            if (panel && !panel.contains(e.target as Node) &&
                bellRef.current && !bellRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [isOpen]);

    const handleAccept = async (inv: Invitation) => {
        try {
            await api.put(`/api/v1/invitations/${inv.id}/accept`);
            const roomsRes = await api.get('/api/v1/rooms/user');
            setRooms(roomsRes.data);
            if (inv.type === 'ROOM' && inv.roomId) setActiveRoom(inv.roomId);
            toast.success(inv.type === 'ROOM' ? `Joined #${inv.roomName}!` : `DM accepted!`);
            setInvitations(prev => prev.filter(i => i.id !== inv.id));
        } catch {
            toast.error('Could not accept invitation.');
        }
    };

    const handleDecline = async (inv: Invitation) => {
        try {
            await api.put(`/api/v1/invitations/${inv.id}/decline`);
            setInvitations(prev => prev.filter(i => i.id !== inv.id));
            toast.success('Invitation declined.');
        } catch {
            toast.error('Could not decline invitation.');
        }
    };

    const count = invitations.length;

    return (
        <>
            <button
                ref={bellRef}
                onClick={openPanel}
                className="relative flex items-center justify-center w-7 h-7 rounded-lg transition-all"
                style={{ color: count > 0 ? 'var(--brand)' : 'var(--foreground)', opacity: count > 0 ? 1 : 0.4 }}
                onMouseEnter={e => { (e.currentTarget).style.background = 'var(--surface-hover)'; (e.currentTarget).style.opacity = '1'; }}
                onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; if (count === 0) (e.currentTarget).style.opacity = '0.4'; }}
                title="Notifications"
                aria-label={`${count} pending notifications`}
            >
                <Bell size={15} />
                <AnimatePresence>
                    {count > 0 && (
                        <motion.span
                            key="badge"
                            initial={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.4, opacity: 0 }}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white pointer-events-none"
                            style={{ background: 'var(--brand)' }}>
                            {count > 9 ? '9+' : count}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {/* Portal — rendered directly in body to escape overflow-hidden */}
            {mounted && isOpen && createPortal(
                <div
                    id="notification-panel-root"
                    style={{
                        position: 'fixed',
                        top: panelPos.top,
                        left: panelPos.left,
                        zIndex: 99999,
                        width: 320,
                        pointerEvents: 'auto',
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="rounded-2xl border overflow-hidden"
                        style={{
                            background: 'var(--surface-elevated)',
                            borderColor: 'var(--border)',
                            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b"
                            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                            <div className="flex items-center gap-2">
                                <Bell size={13} style={{ color: 'var(--brand)' }} />
                                <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Notifications</span>
                                {count > 0 && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                        style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>{count}</span>
                                )}
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-1 rounded transition-colors"
                                style={{ color: 'var(--foreground)', opacity: 0.5 }}
                                onMouseEnter={e => (e.currentTarget).style.opacity = '1'}
                                onMouseLeave={e => (e.currentTarget).style.opacity = '0.5'}>
                                <X size={13} />
                            </button>
                        </div>

                        {/* List */}
                        <div className="max-h-80 overflow-y-auto">
                            {isFetching && invitations.length === 0 ? (
                                <div className="flex items-center justify-center py-10">
                                    <div className="w-5 h-5 rounded-full border-2 animate-spin"
                                        style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
                                </div>
                            ) : invitations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-2">
                                    <Bell size={24} style={{ color: 'var(--foreground)', opacity: 0.15 }} />
                                    <p className="text-xs font-medium" style={{ color: 'var(--foreground)', opacity: 0.35 }}>No pending notifications</p>
                                </div>
                            ) : (
                                invitations.map(inv => (
                                    <div key={inv.id}
                                        className="flex items-start gap-3 px-4 py-3 border-b"
                                        style={{ borderColor: 'var(--border)' }}>
                                        <div className="mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                                            style={{ background: inv.type === 'ROOM' ? 'var(--brand-light)' : 'rgba(99,102,241,0.12)' }}>
                                            {inv.type === 'ROOM'
                                                ? <Hash size={13} style={{ color: 'var(--brand)' }} />
                                                : <MessageCircle size={13} style={{ color: '#818cf8' }} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs leading-snug" style={{ color: 'var(--foreground)' }}>
                                                <span className="font-semibold">{inv.fromUsername}</span>{' '}
                                                {inv.type === 'ROOM'
                                                    ? <> invited you to <span className="font-semibold" style={{ color: 'var(--brand)' }}>#{inv.roomName}</span></>
                                                    : 'wants to chat with you'}
                                            </p>
                                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--foreground)', opacity: 0.4 }}>
                                                {new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <div className="flex gap-2 mt-2">
                                                <button onClick={() => handleAccept(inv)}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg text-white transition-all"
                                                    style={{ background: 'var(--brand)' }}
                                                    onMouseEnter={e => (e.currentTarget).style.background = 'var(--brand-hover)'}
                                                    onMouseLeave={e => (e.currentTarget).style.background = 'var(--brand)'}>
                                                    <Check size={10} /> Accept
                                                </button>
                                                <button onClick={() => handleDecline(inv)}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-colors"
                                                    style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}
                                                    onMouseEnter={e => (e.currentTarget).style.background = 'var(--surface-hover)'}
                                                    onMouseLeave={e => (e.currentTarget).style.background = 'transparent'}>
                                                    <X size={10} /> Decline
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}
        </>
    );
}
