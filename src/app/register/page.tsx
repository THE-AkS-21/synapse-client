'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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
            // Backend expects /api/auth/register
            const res = await api.post('/api/auth/register', { username, email, password });

            const { token, user } = res.data;
            setAuth(user, token);

            router.push('/dashboard');
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center animated-bg relative overflow-hidden px-4">
            <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <div className="glass rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-2xl bg-black/40 border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 pointer-events-none"></div>

                    <div className="text-center mb-8 relative z-10">
                        <h1 className="text-4xl font-heading font-bold mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                            Join Synapse
                        </h1>
                        <p className="text-zinc-400 font-medium">Create your account to get started</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5 relative z-10">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3 text-red-500 text-sm">
                                <AlertCircle size={16} />
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <Input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                icon={<UserIcon size={18} />}
                                required
                                minLength={3}
                            />
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
                                minLength={6}
                            />
                        </div>

                        <Button type="submit" className="w-full mt-2" size="md" isLoading={isLoading}>
                            Create Account
                        </Button>

                        <p className="text-center text-sm text-zinc-400 mt-6 font-medium">
                            Already have an account?{' '}
                            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
