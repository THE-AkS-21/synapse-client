'use client';

import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { RoomService } from '@/services/room.service';
import { motion } from 'framer-motion';
import { UserMinus, MessageCircle, Shield, X, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEffect, useState, useMemo } from "react";
import Link from 'next/link';

export default function RightSidebar() {
    const { activeRoomId, onlineUsers, rooms, addRoom, setActiveRoom } = useChatStore();
    const currentUser = useAuthStore(state => state.user);
    const { closeSidebars } = useUiStore();

    const currentOnlineUsers = useMemo(() =>
            activeRoomId ? (onlineUsers[activeRoomId] || []) : [],
        [activeRoomId, onlineUsers]);

    const room = rooms.find(r => r.id === activeRoomId);
    const [allMembers, setAllMembers] = useState<any[]>([]);

    const isCreator = room?.creatorId === Number(currentUser?.id);

    useEffect(() => {
        if (!activeRoomId) {
            setAllMembers([]);
            return;
        }

        RoomService.getRoomParticipants(activeRoomId)
            .then(data => setAllMembers(data))
            .catch(() => {
                toast.error("Could not load room members.");
                setAllMembers([]);
            });
    }, [activeRoomId]);

    const handleRemoveMember = async (userId: string, username: string) => {
        if (!activeRoomId || !confirm(`Remove @${username} from this room?`)) return;
        try {
            await RoomService.removeParticipant(activeRoomId, userId);
            toast.success(`@${username} removed.`);
            setAllMembers(prev => prev.filter(m => String(m.id) !== String(userId)));
        } catch {
            toast.error('Failed to remove member.');
        }
    };

    const handleStartDM = async (partnerId: string, partnerUsername: string) => {
        const existing = rooms.find(r => r.type === 'DIRECT' && r.dmPartner === partnerUsername);
        if (existing) {
            setActiveRoom(existing.id);
            closeSidebars();
            return;
        }

        try {
            const data = await RoomService.startDirectMessage(Number(currentUser?.id), Number(partnerId));
            const newRoom = { ...data, type: 'DIRECT' as const, dmPartner: partnerUsername };
            addRoom(newRoom, currentUser?.id);
            setActiveRoom(newRoom.id);
            toast.success(`DM with @${partnerUsername} opened!`);
            closeSidebars();
        } catch {
            toast.error('Failed to open DM.');
        }
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
    const itemVariants = { hidden: { opacity: 0, x: 16 }, visible: { opacity: 1, x: 0 } };

    return (
        <aside className="w-72 sm:w-80 lg:w-60 flex flex-col h-full flex-shrink-0 relative overflow-hidden border-l bg-sidebar-bg border-sidebar-border">

            <div className="h-16 flex flex-shrink-0 items-center justify-between px-5 border-b border-sidebar-border bg-surface relative z-10">
                <h3 className="font-heading font-semibold text-sm text-foreground">Room Members</h3>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-brand bg-brand-light px-2 py-0.5 rounded-full border border-border">
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-brand" />
                        {currentOnlineUsers.length}
                    </span>
                    <button onClick={closeSidebars} className="lg:hidden p-1 text-foreground/50 hover:text-foreground transition-colors"><X size={18}/></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 relative z-10">
                <motion.ul variants={containerVariants} initial="hidden" animate="visible" className="space-y-1">
                    {allMembers.map((u) => {
                        const isMe = u.username === currentUser?.username;
                        const isAdmin = room?.creatorId === Number(u.id);

                        const isOnline = isMe || currentOnlineUsers.some(ou =>
                            String(ou.id) === String(u.id) ||
                            ou.username === u.username ||
                            ou.username === u.email
                        );

                        return (
                            <motion.li variants={itemVariants} key={u.id} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl group hover:bg-surface-hover transition-all duration-150">
                                <div className="relative shrink-0">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm transition-colors ${isOnline ? 'bg-brand' : 'bg-foreground/20 grayscale opacity-60'}`}>
                                        {u.username.charAt(0).toUpperCase()}
                                    </div>
                                    {isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface bg-brand shadow-sm" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate flex items-center gap-1 text-foreground">
                                        {u.username} {isAdmin && <Shield size={12} className="text-brand" />}
                                    </p>
                                    <p className={`text-[11px] font-medium ${isOnline ? 'text-brand' : 'text-foreground/50'}`}>
                                        {isOnline ? 'Online' : 'Offline'}
                                    </p>
                                </div>

                                {!isMe && (
                                    <button onClick={() => handleStartDM(u.id, u.username)} className="p-1.5 rounded-md text-brand hover:bg-brand/10 opacity-0 group-hover:opacity-100 transition-all">
                                        <MessageCircle size={13} />
                                    </button>
                                )}
                                {isCreator && !isMe && (
                                    <button onClick={() => handleRemoveMember(u.id, u.username)} className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all">
                                        <UserMinus size={13} />
                                    </button>
                                )}
                            </motion.li>
                        );
                    })}
                </motion.ul>
            </div>

            {/* About Page Link */}
            <div className="p-4 border-t border-sidebar-border bg-surface flex justify-center flex-shrink-0">
                <Link href="/about" className="flex items-center gap-1.5 text-xs font-medium text-foreground/50 hover:text-brand transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-hover">
                    <Info size={13} /> About Synapse
                </Link>
            </div>
        </aside>
    );
}