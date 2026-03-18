'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, AlertCircle, Users, MessageCircle, Clock, Shield, EyeOff, Eye } from 'lucide-react';
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
    const [showPassword, setShowPassword] = useState(false);
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
            const { token, username, id } = res.data;
            setAuth({ id: String(id), username, email }, token);
            router.push('/dashboard');
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string, username?: string } } };
            const data = e.response?.data;
            const backendError = data?.message || data?.username;

            setError(backendError || 'Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full bg-background border border-border text-foreground placeholder:text-foreground/40 rounded-xl pl-10 pr-10 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row animated-bg relative overflow-hidden">

            {/* Ambient orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <motion.div key={i}
                                animate={{ y: [0, -14, 0] }}
                                transition={{ duration: 5 + i * 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
                                className="absolute rounded-full blur-3xl bg-brand opacity-[0.08]"
                                style={{
                                    width: `${200 + i * 60}px`, height: `${200 + i * 60}px`,
                                    left: `${[5, 58, 82, 12, 42][i]}%`, top: `${[10, 5, 55, 70, 82][i]}%`,
                                }}
                    />
                ))}
            </div>

            {/* LEFT — value prop */}
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="hidden lg:flex flex-col justify-between w-[46%] p-12 xl:p-16 relative z-10"
            >
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-brand rounded-2xl blur-lg opacity-40" />
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-border shadow-2xl bg-surface">
                            <Image src="/synapse_logo.png" alt="Synapse" fill className="object-cover" priority />
                        </div>
                    </div>
                    <div>
                        <span className="font-heading font-bold text-xl text-brand leading-none">
                            Synapse
                        </span>
                        <p className="text-[11px] text-foreground/50 font-medium mt-0.5">Real-time Chat</p>
                    </div>
                </div>

                <div className="space-y-10">
                    <div>
                        <h2 className="text-4xl xl:text-5xl font-heading font-bold text-foreground leading-tight mb-4">
                            Talk to your people.<br />
                            <span className="text-brand">Right now.</span>
                        </h2>
                        <p className="text-foreground/70 text-[15px] leading-relaxed max-w-sm">
                            Synapse brings your team together — wherever they are. Fast, focused conversations that keep everyone in the loop.
                        </p>
                    </div>
                    <div className="space-y-5">
                        {BENEFITS.map((b, i) => (
                            <motion.div key={b.title} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + i * 0.1 }} className="flex items-start gap-3">
                                <span className="mt-0.5 shrink-0 text-brand w-8 h-8 bg-brand-light rounded-lg flex items-center justify-center border border-border">
                                    {b.icon}
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{b.title}</p>
                                    <p className="text-xs text-foreground/60 leading-relaxed mt-0.5">{b.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-foreground/50 font-medium">
                        Synapse is developed by <span className="text-brand font-semibold">skaeht</span>
                    </p>
                    <p className="text-[11px] text-foreground/40 font-mono">© 2025 skaeht · All rights reserved</p>
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
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <div className="relative mb-3">
                            <div className="absolute inset-0 bg-brand rounded-3xl blur-lg opacity-40" />
                            <div className="relative w-20 h-20 rounded-3xl overflow-hidden border-2 border-border shadow-2xl bg-surface">
                                <Image src="/synapse_logo.png" alt="Synapse" fill className="object-cover" priority />
                            </div>
                        </div>
                        <span className="font-heading font-bold text-2xl text-brand">Synapse</span>
                        <p className="text-xs text-foreground/50 mt-1">Real-time Chat Platform</p>
                    </div>

                    <div className="glass rounded-3xl p-8 shadow-2xl">
                        <div className="mb-7">
                            <h1 className="text-2xl font-heading font-bold text-foreground mb-1.5">Welcome back</h1>
                            <p className="text-sm text-foreground/60">Sign in to pick up where you left off</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                                            className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2.5 text-red-500 text-sm">
                                    <AlertCircle size={15} className="shrink-0" /><p>{error}</p>
                                </motion.div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs text-foreground/60 font-medium pl-1">Email</label>
                                <div className="relative">
                                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                                    <input
                                        type="email"
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-foreground/60 font-medium pl-1">Password</label>
                                <div className="relative">
                                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className={inputClass}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-foreground/40 hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-1">
                                <Button type="submit" className="w-full bg-brand hover:bg-brand-hover text-white" size="md" isLoading={isLoading}>
                                    Sign In →
                                </Button>
                            </div>
                            <p className="text-center text-sm text-foreground/50 pt-1">
                                Don&apos;t have an account?{' '}
                                <Link href="/register" className="text-brand hover:text-brand-hover transition-colors font-medium underline underline-offset-2">Create one</Link>
                            </p>
                        </form>
                    </div>

                    <div className="lg:hidden mt-6 text-center space-y-1">
                        <p className="text-xs text-foreground/50">Synapse is developed by <span className="text-brand font-semibold">skaeht</span></p>
                        <p className="text-[11px] text-foreground/40 font-mono">© 2025 skaeht · All rights reserved</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}