'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';


const PROMISES = [
    'No account sharing — everyone gets their own secure space',
    'Your conversations stay private. Always.',
    'Join a room in seconds — no invites or setup required',
    'Works from any browser, any device, any time',
];

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { setAuth } = useAuthStore();
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await api.post('/api/auth/register', { username, email, password });
            // Backend now returns token + user on successful registration (auto-login)
            if (res.data?.token && res.data?.username) {
                const { token, username: uname, id } = res.data;
                // Pass uname as the id to satisfy the User interface requirements
                setAuth({ id: String(id), username, email }, token);
                router.push('/dashboard');
            } else {
                router.push('/login?registered=1');
            }
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } | string } };
            const raw = e.response?.data;
            const msg = typeof raw === 'object' && raw !== null
                ? (raw as { message?: string }).message
                : typeof raw === 'string' ? raw : null;
            const errorMsg = msg || 'Registration failed. Please try again.';
            setError(errorMsg);
            // Show specific toast for conflicts (username/email taken)
            if ((err as { response?: { status?: number } }).response?.status === 409) {
                toast.error(`⚠️ ${errorMsg}`, { duration: 5000 });
            }
        } finally {
            setIsLoading(false);
        }
    };


    const inputClass = "w-full bg-white/8 border border-white/12 text-white placeholder:text-zinc-500 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-cyan-500/60 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20 transition-all";

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row-reverse animated-bg relative overflow-hidden">

            {/* Ambient orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <motion.div key={i}
                        animate={{ y: [0, -16, 0], x: [0, 8, 0] }}
                        transition={{ duration: 5 + i * 1.3, repeat: Infinity, ease: 'easeInOut' as const, delay: i * 0.8 }}
                        className="absolute rounded-full blur-3xl"
                        style={{
                            width: `${180 + i * 55}px`, height: `${180 + i * 55}px`,
                            left: `${[80, 20, 62, 5, 45][i]}%`, top: `${[15, 60, 5, 40, 80][i]}%`,
                            background: ['rgba(6,182,212,0.16)', 'rgba(99,102,241,0.12)', 'rgba(139,92,246,0.10)', 'rgba(34,211,238,0.09)', 'rgba(167,139,250,0.12)'][i],
                        }}
                    />
                ))}
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)',
                    backgroundSize: '60px 60px',
                }} />
            </div>

            {/* RIGHT — value prop */}
            <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="hidden lg:flex flex-col justify-between w-[46%] p-12 xl:p-16 relative z-10"
            >
                {/* Logo — prominent */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/40 to-indigo-500/30 rounded-2xl blur-lg" />
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
                            <Image src="/synapse_logo.png" alt="Synapse" fill className="object-cover" priority />
                        </div>
                    </div>
                    <div>
                        <span className="font-heading font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400 leading-none">
                            Synapse
                        </span>
                        <p className="text-[11px] text-zinc-500 font-medium mt-0.5">Real-time Chat</p>
                    </div>
                </div>

                <div className="space-y-10">
                    <div>
                        <h2 className="text-4xl xl:text-5xl font-heading font-bold text-white leading-tight mb-4">
                            Stop emailing.<br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
                                Start talking.
                            </span>
                        </h2>
                        <p className="text-zinc-400 text-[15px] leading-relaxed max-w-sm">
                            Create an account, jump into a room, and your whole team is on the same page — instantly. No setup needed.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {PROMISES.map((promise, i) => (
                            <motion.div key={promise} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }} className="flex items-start gap-3">
                                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                                <p className="text-sm text-zinc-300 leading-snug">{promise}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-zinc-500 font-medium">
                        Synapse is developed by{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400 font-semibold">skaeht</span>
                    </p>
                    <p className="text-[11px] text-zinc-600 font-mono">© 2025 skaeht · All rights reserved</p>
                </div>
            </motion.div>

            {/* LEFT — registration form */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 28, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="w-full max-w-sm"
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <div className="relative mb-3">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/40 to-indigo-500/30 rounded-3xl blur-lg" />
                            <div className="relative w-20 h-20 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl">
                                <Image src="/synapse_logo.png" alt="Synapse" fill className="object-cover" priority />
                            </div>
                        </div>
                        <span className="font-heading font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">Synapse</span>
                        <p className="text-xs text-zinc-500 mt-1">Real-time Chat Platform</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-2xl border border-white/12 rounded-3xl p-8 shadow-2xl shadow-black/50">
                        <div className="mb-7">
                            <h1 className="text-2xl font-heading font-bold text-white mb-1.5">Create your account</h1>
                            <p className="text-sm text-zinc-400">Free, instant, and takes under a minute</p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-3.5">
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-500/12 border border-red-500/25 rounded-xl p-3 flex items-center gap-2.5 text-red-400 text-sm">
                                    <AlertCircle size={15} className="shrink-0" /><p>{error}</p>
                                </motion.div>
                            )}

                            <div className="relative">
                                <UserIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                                <input type="text" placeholder="Choose a username" value={username}
                                    onChange={(e) => setUsername(e.target.value)} required minLength={3}
                                    className={inputClass} />
                            </div>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                                <input type="email" placeholder="Email address" value={email}
                                    onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
                            </div>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                                <input type="password" placeholder="Password (min 6 chars)" value={password}
                                    onChange={(e) => setPassword(e.target.value)} required minLength={6}
                                    className={inputClass} />
                            </div>

                            <div className="pt-1">
                                <Button type="submit" className="w-full" size="md" isLoading={isLoading}>
                                    Create Account →
                                </Button>
                            </div>
                            <p className="text-center text-sm text-zinc-500 pt-1">
                                Already have an account?{' '}
                                <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium underline underline-offset-2">Sign in</Link>
                            </p>
                        </form>
                    </div>

                    <div className="lg:hidden mt-6 text-center space-y-1">
                        <p className="text-xs text-zinc-500">Synapse is developed by <span className="text-cyan-400 font-semibold">skaeht</span></p>
                        <p className="text-[11px] text-zinc-600">© 2025 skaeht · All rights reserved</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
