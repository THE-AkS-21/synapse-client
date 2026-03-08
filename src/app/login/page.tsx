'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, AlertCircle, Users, MessageCircle, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const BENEFITS = [
    {
        icon: <MessageCircle size={15} />,
        title: 'No delays, ever',
        desc: 'Messages appear the instant they are sent — no refresh, no waiting.',
    },
    {
        icon: <Users size={15} />,
        title: 'Rooms for every team',
        desc: 'Create a space for a project, hobby, or group of friends in seconds.',
    },
    {
        icon: <Clock size={15} />,
        title: 'Your messages, your history',
        desc: 'Scroll back through conversations — chat history is always there for you.',
    },
    {
        icon: <Shield size={15} />,
        title: 'Private by design',
        desc: 'Secure authentication so only the right people see the right conversations.',
    },
];

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { setAuth } = useAuthStore();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await api.post('/api/auth/login', { email, password });
            const { token, username } = res.data;
            setAuth({ id: username, username, email }, token);
            router.push('/dashboard');
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e.response?.data?.message || 'Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row animated-bg relative overflow-hidden">

            {/* Ambient orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <motion.div key={i}
                        animate={{ y: [0, -14, 0] }}
                        transition={{ duration: 5 + i * 1.2, repeat: Infinity, ease: 'easeInOut' as const, delay: i * 0.7 }}
                        className="absolute rounded-full blur-3xl"
                        style={{
                            width: `${200 + i * 60}px`, height: `${200 + i * 60}px`,
                            left: `${[5, 58, 82, 12, 42][i]}%`, top: `${[10, 5, 55, 70, 82][i]}%`,
                            background: ['rgba(99,102,241,0.18)', 'rgba(139,92,246,0.12)', 'rgba(6,182,212,0.10)', 'rgba(167,139,250,0.12)', 'rgba(34,211,238,0.08)'][i],
                        }}
                    />
                ))}
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)',
                    backgroundSize: '60px 60px',
                }} />
            </div>

            {/* LEFT — value prop */}
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="hidden lg:flex flex-col justify-between w-[46%] p-12 xl:p-16 relative z-10"
            >
                {/* Logo — large prominent */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 to-cyan-500/30 rounded-2xl blur-lg" />
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
                            <Image src="/synapse_logo.png" alt="Synapse" fill className="object-cover" priority />
                        </div>
                    </div>
                    <div>
                        <span className="font-heading font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 leading-none">
                            Synapse
                        </span>
                        <p className="text-[11px] text-zinc-500 font-medium mt-0.5">Real-time Chat</p>
                    </div>
                </div>

                <div className="space-y-10">
                    <div>
                        <h2 className="text-4xl xl:text-5xl font-heading font-bold text-white leading-tight mb-4">
                            Talk to your people.<br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                                Right now.
                            </span>
                        </h2>
                        <p className="text-zinc-400 text-[15px] leading-relaxed max-w-sm">
                            Synapse brings your team together — wherever they are. Fast, focused conversations that keep everyone in the loop.
                        </p>
                    </div>
                    <div className="space-y-5">
                        {BENEFITS.map((b, i) => (
                            <motion.div key={b.title} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }} className="flex items-start gap-3">
                                <span className="mt-0.5 shrink-0 text-indigo-400 w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
                                    {b.icon}
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-white">{b.title}</p>
                                    <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">{b.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-zinc-500 font-medium">
                        Synapse is developed by{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 font-semibold">skaeht</span>
                    </p>
                    <p className="text-[11px] text-zinc-600 font-mono">© 2025 skaeht · All rights reserved</p>
                </div>
            </motion.div>

            {/* RIGHT — login form */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 28, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="w-full max-w-sm"
                >
                    {/* Mobile logo — large */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <div className="relative mb-3">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 to-cyan-500/30 rounded-3xl blur-lg" />
                            <div className="relative w-20 h-20 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl">
                                <Image src="/synapse_logo.png" alt="Synapse" fill className="object-cover" priority />
                            </div>
                        </div>
                        <span className="font-heading font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Synapse</span>
                        <p className="text-xs text-zinc-500 mt-1">Real-time Chat Platform</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-2xl border border-white/12 rounded-3xl p-8 shadow-2xl shadow-black/50">
                        <div className="mb-7">
                            <h1 className="text-2xl font-heading font-bold text-white mb-1.5">Welcome back</h1>
                            <p className="text-sm text-zinc-400">Sign in to pick up where you left off</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-500/12 border border-red-500/25 rounded-xl p-3 flex items-center gap-2.5 text-red-400 text-sm">
                                    <AlertCircle size={15} className="shrink-0" /><p>{error}</p>
                                </motion.div>
                            )}

                            {/* Custom styled inputs for dark bg */}
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-400 font-medium pl-1">Email</label>
                                <div className="relative">
                                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                                    <input
                                        type="email"
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-white/8 border border-white/12 text-white placeholder:text-zinc-500 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-indigo-500/60 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-400 font-medium pl-1">Password</label>
                                <div className="relative">
                                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                                    <input
                                        type="password"
                                        placeholder="Your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full bg-white/8 border border-white/12 text-white placeholder:text-zinc-500 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-indigo-500/60 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-1">
                                <Button type="submit" className="w-full" size="md" isLoading={isLoading}>
                                    Sign In →
                                </Button>
                            </div>
                            <p className="text-center text-sm text-zinc-500 pt-1">
                                Don&apos;t have an account?{' '}
                                <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium underline underline-offset-2">Create one</Link>
                            </p>
                        </form>
                    </div>

                    <div className="lg:hidden mt-6 text-center space-y-1">
                        <p className="text-xs text-zinc-500">Synapse is developed by <span className="text-indigo-400 font-semibold">skaeht</span></p>
                        <p className="text-[11px] text-zinc-600">© 2025 skaeht · All rights reserved</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
