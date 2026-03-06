'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

            const { token, user } = res.data;
            setAuth(user, token);

            router.push('/dashboard');
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e.response?.data?.message || 'Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center animated-bg relative overflow-hidden px-4">
            {/* Abstract floating shapes */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <div className="glass rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-2xl bg-black/40 border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>

                    <div className="text-center mb-8 relative z-10">
                        <h1 className="text-4xl font-heading font-bold mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                            Synapse
                        </h1>
                        <p className="text-zinc-400 font-medium">Welcome back, enter your details</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5 relative z-10">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3 text-red-500 text-sm">
                                <AlertCircle size={16} />
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <Input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                icon={<Mail size={18} />}
                                required
                            />
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={<Lock size={18} />}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full mt-2" size="md" isLoading={isLoading}>
                            Sign In
                        </Button>

                        <p className="text-center text-sm text-zinc-400 mt-6 font-medium">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                Create one now
                            </Link>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
