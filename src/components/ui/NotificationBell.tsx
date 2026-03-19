'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, X, MessageCircle, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { InvitationService } from '@/services/invitation.service';
import { RoomService } from '@/services/room.service';
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
    const [panelStyle, setPanelStyle] = useState({ top: 0, left: 0, width: 320 });
    const [mounted, setMounted] = useState(false);
    const bellRef = useRef<HTMLButtonElement>(null);

    const { setRooms, setActiveRoom } = useChatStore();
    const currentUser = useAuthStore(state => state.user);

    useEffect(() => { setMounted(true); }, []);

    const fetchPending = async () => {
        try {
            setIsFetching(true);
            const data = await InvitationService.getPending();
            setInvitations(data || []);
        } catch {
            // Silently ignore background fetch errors to prevent toast spam
        } finally {
            setIsFetching(false);
        }
    };

    // Background polling for new invites
    useEffect(() => {
        fetchPending();
        const interval = setInterval(fetchPending, 30_000);
        return () => clearInterval(interval);
    }, []);

    const calculatePosition = () => {
        if (!bellRef.current) return;
        const rect = bellRef.current.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const width = Math.min(320, screenWidth - 32);
        let left = rect.left;

        // Prevent panel from bleeding off the right edge of the screen
        if (left + width > screenWidth - 16) left = screenWidth - width - 16;
        left = Math.max(16, left);

        setPanelStyle({ top: rect.bottom + 8, left: left, width: width });
    };

    const openPanel = () => {
        calculatePosition();
        setIsOpen(v => !v);
        if (!isOpen) fetchPending();
    };

    // Click-outside listener
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

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('resize', calculatePosition);
            return () => window.removeEventListener('resize', calculatePosition);
        }
    }, [isOpen]);

    const handleAccept = async (inv: Invitation) => {
        try {
            await InvitationService.accept(inv.id);
            const roomsData = await RoomService.getUserRooms();

            setRooms(roomsData, currentUser?.id);

            if (inv.type === 'ROOM' && inv.roomId) setActiveRoom(inv.roomId);
            toast.success(inv.type === 'ROOM' ? `Joined #${inv.roomName}!` : `DM accepted!`);

            setInvitations(prev => prev.filter(i => i.id !== inv.id));
            setIsOpen(false);
        } catch {
            toast.error('Could not accept invitation.');
        }
    };

    const handleDecline = async (inv: Invitation) => {
        try {
            await InvitationService.decline(inv.id);
            setInvitations(prev => prev.filter(i => i.id !== inv.id));
            toast.success('Invitation declined.');
            setIsOpen(false);
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
                className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-brand/50 hover:bg-surface-hover ${
                    count > 0 ? 'text-brand' : 'text-foreground/50 hover:text-foreground'
                }`}
                title="Notifications"
                aria-label={`${count} pending notifications`}
            >
                <Bell size={16} />
                <AnimatePresence>
                    {count > 0 && (
                        <motion.span
                            key="badge"
                            initial={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.4, opacity: 0 }}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white bg-brand pointer-events-none"
                        >
                            {count > 9 ? '9+' : count}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {mounted && isOpen && createPortal(
                <div
                    id="notification-panel-root"
                    style={{
                        position: 'fixed',
                        top: panelStyle.top,
                        left: panelStyle.left,
                        width: panelStyle.width,
                        zIndex: 99999,
                        pointerEvents: 'auto',
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="rounded-2xl border border-border bg-surface-elevated shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
                            <div className="flex items-center gap-2">
                                <Bell size={14} className="text-brand" />
                                <span className="font-semibold text-sm text-foreground">Notifications</span>
                                {count > 0 && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-light text-brand">
                                        {count}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-lg text-foreground/50 hover:text-foreground hover:bg-surface-hover transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* List Content */}
                        <div className="max-h-80 overflow-y-auto bg-surface-elevated">
                            {isFetching && invitations.length === 0 ? (
                                <div className="flex items-center justify-center py-10">
                                    <div className="w-5 h-5 rounded-full border-2 border-brand border-t-transparent animate-spin" />
                                </div>
                            ) : invitations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-2">
                                    <Bell size={24} className="text-foreground/20" />
                                    <p className="text-xs font-medium text-foreground/40">No pending notifications</p>
                                </div>
                            ) : (
                                invitations.map(inv => (
                                    <div key={inv.id} className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-surface transition-colors">
                                        <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                            inv.type === 'ROOM' ? 'bg-brand-light text-brand' : 'bg-indigo-500/10 text-indigo-500'
                                        }`}>
                                            {inv.type === 'ROOM' ? <Hash size={13} /> : <MessageCircle size={13} />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs leading-snug text-foreground">
                                                <span className="font-semibold">{inv.fromUsername}</span>{' '}
                                                {inv.type === 'ROOM'
                                                    ? <>invited you to <span className="font-semibold text-brand">#{inv.roomName}</span></>
                                                    : 'wants to chat with you'}
                                            </p>
                                            <p className="text-[10px] mt-0.5 text-foreground/40">
                                                {new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 mt-2.5">
                                                <button onClick={() => handleAccept(inv)}
                                                        className="flex items-center justify-center flex-1 gap-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg text-white bg-brand hover:bg-brand-hover transition-colors">
                                                    <Check size={12} /> Accept
                                                </button>
                                                <button onClick={() => handleDecline(inv)}
                                                        className="flex items-center justify-center flex-1 gap-1 px-3 py-1.5 text-[11px] font-medium rounded-lg border border-border text-foreground hover:bg-surface-hover transition-colors">
                                                    <X size={12} /> Decline
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