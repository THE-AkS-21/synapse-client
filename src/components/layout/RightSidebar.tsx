'use client';

import { useChatStore } from '@/store/chatStore';
import { motion, Variants } from 'framer-motion';

export default function RightSidebar() {
    const { activeRoomId, onlineUsers } = useChatStore();

    const currentOnlineUsers = activeRoomId ? (onlineUsers[activeRoomId] || []) : [];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <aside className="w-64 bg-surface/50 backdrop-blur-2xl border-l border-border flex flex-col h-full flex-shrink-0 transition-colors duration-300 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="h-16 flex items-center px-6 border-b border-border bg-surface/80 backdrop-blur-md relative z-10">
                <h3 className="font-heading font-semibold tracking-tight text-foreground/90">Room Members</h3>
            </div>

            <div className="flex-1 overflow-y-auto py-5 px-4 space-y-6 relative z-10">
                <div>
                    <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4 list-none px-2 flex justify-between items-center">
                        <span>Online</span>
                        <span className="bg-brand/10 text-brand px-2 py-0.5 rounded-full">{currentOnlineUsers.length}</span>
                    </h4>

                    <motion.ul
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-1.5"
                    >
                        {currentOnlineUsers.map((u) => (
                            <motion.li
                                variants={itemVariants}
                                key={u.id}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-hover cursor-pointer overflow-hidden transition-all duration-200 group border border-transparent hover:border-white/5 shadow-sm hover:shadow-md"
                            >
                                <div className="relative">
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand to-cyan-500 flex items-center justify-center text-sm font-bold text-white shadow-inner transform group-hover:scale-105 transition-transform duration-300">
                                        {u.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-surface rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                                </div>
                                <span className="text-sm font-medium text-foreground/90 truncate group-hover:text-brand transition-colors duration-200">
                                    {u.username}
                                </span>
                            </motion.li>
                        ))}

                        {currentOnlineUsers.length === 0 && (
                            <motion.div variants={itemVariants} className="text-xs text-zinc-500 italic px-3 py-4 text-center bg-surface-elevated/50 rounded-xl border border-dashed border-border/50">
                                Waiting for others to join...
                            </motion.div>
                        )}
                    </motion.ul>
                </div>
            </div>
        </aside>
    );
}
