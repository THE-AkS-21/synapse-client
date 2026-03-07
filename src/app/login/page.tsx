'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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
            // Backend expects /api/auth/login
            const res = await api.post('/api/auth/login', { email, password });

            const { token, username } = res.data;

            setAuth(
                {
                    id: username,
                    username,
                    email,
                },
                token
            );

            router.push('/dashboard');
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e.response?.data?.message || 'Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center animated-bg relative overflow-hidden px-4">
            {/* Abstract floating shapes */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md z-10"
            >
                <div className="glass rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-2xl bg-surface/80 border-border">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>

                    <div className="text-center mb-8 relative z-10 flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-black/20 p-3 rounded-2xl backdrop-blur-md border border-white/5 shadow-inner mb-4"
                        >
                            <Image src="/synapse_logo.png" alt="Synapse Logo" width={64} height={64} className="drop-shadow-lg" priority />
                        </motion.div>
                        <h1 className="text-4xl font-heading font-bold mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                            Synapse
                        </h1>
                        <p className="text-zinc-400 font-medium">Welcome back, enter your details</p>
                    </div>

                    <motion.form
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1, delayChildren: 0.3 }
                            }
                        }}
                        initial="hidden"
                        animate="show"
                        onSubmit={handleLogin}
                        className="space-y-5 relative z-10"
                    >
                        {error && (
                            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3 text-red-500 text-sm">
                                <AlertCircle size={16} />
                                <p>{error}</p>
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                                <Input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    icon={<Mail size={18} />}
                                    required
                                />
                            </motion.div>
                            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    icon={<Lock size={18} />}
                                    required
                                />
                            </motion.div>
                        </div>

                        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                            <Button type="submit" className="w-full mt-2" size="md" isLoading={isLoading}>
                                Sign In
                            </Button>
                        </motion.div>

                        <motion.p variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="text-center text-sm text-zinc-400 mt-6 font-medium">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                Create one now
                            </Link>
                        </motion.p>
                    </motion.form>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="absolute bottom-6 left-0 right-0 text-center flex flex-col items-center justify-center space-y-1 z-0 pointer-events-none"
            >
                <p className="text-xs text-zinc-500 font-mono tracking-wider">Synapse is developed by Synapse</p>
                <p className="text-xs font-medium text-zinc-400">
                    Developed by <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-semibold">Ankit Kumar Singh</span>
                </p>
            </motion.div>
        </div>
    );
}
