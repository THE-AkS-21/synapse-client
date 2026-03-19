'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, Linkedin, Mail, Zap, Eye, Rocket, Heart, Code2, Globe, Users, MessageCircle } from 'lucide-react';

const STATS = [
    { label: 'Real-time', value: 'WebSocket engine', sub: 'Messages delivered instantly' },
    { label: 'Secure', value: 'JWT + BCrypt', sub: 'Every request authenticated' },
    { label: 'Reliable', value: 'Redis buffering', sub: 'No messages ever dropped' },
];

const FEATURES_NOW = [
    { icon: <MessageCircle size={16} />, text: 'Create public or private chat rooms' },
    { icon: <Users size={16} />, text: 'See who is online in real time' },
    { icon: <Globe size={16} />, text: 'Join any room using a unique Room ID' },
    { icon: <Code2 size={16} />, text: 'Update your password from your profile' },
    { icon: <Zap size={16} />, text: 'Typing indicators so conversations feel alive' },
    { icon: <Heart size={16} />, text: 'Automatic 7-day message cleanup' },
];

const FUTURE_SCOPE = [
    {
        icon: <Rocket size={18} />,
        title: 'Mobile apps',
        desc: 'Native iOS and Android clients so Synapse goes everywhere you go.',
    },
    {
        icon: <Globe size={18} />,
        title: 'Voice & video rooms',
        desc: 'One-click audio and video calls built right into the chat experience.',
    },
    {
        icon: <Users size={18} />,
        title: 'Team workspaces',
        desc: 'Organise rooms under a shared workspace — perfect for companies and communities.',
    },
    {
        icon: <Eye size={18} />,
        title: 'Read receipts & reactions',
        desc: 'Know when your message landed and let people respond with an emoji.',
    },
    {
        icon: <Code2 size={18} />,
        title: 'Open integrations',
        desc: 'Webhooks and bots so your tools can talk inside Synapse automatically.',
    },
    {
        icon: <Zap size={18} />,
        title: 'AI-powered summaries',
        desc: 'Catch up on long threads in seconds with an automated conversation digest.',
    },
];

const fadeUp = (delay: number = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: 'easeOut' as const },
});

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            <nav className="sticky top-0 z-50 glass border-x-0 border-t-0 border-b border-border">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors group font-medium">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to app
                    </Link>
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg overflow-hidden border border-border shadow-sm shrink-0">
                            <Image src="/synapse_logo.png" alt="Synapse" width={28} height={28} className="object-cover" />
                        </div>
                        <span className="font-heading font-bold text-sm text-brand">
                            Synapse
                        </span>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-16 space-y-24">

                <motion.section {...fadeUp(0)} className="text-center max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand bg-brand-light border border-brand/20 px-3 py-1 rounded-full mb-5">
                        <Zap size={11} /> About this project
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground leading-tight mb-5">
                        Built for people who<br />
                        <span className="text-brand">need to stay connected.</span>
                    </h1>
                    <p className="text-lg text-foreground/60 leading-relaxed">
                        Synapse started as a simple question: what if messaging felt as natural and fast as talking in person? This is the answer — a real-time chat platform designed around people, not processes.
                    </p>
                </motion.section>

                <motion.section {...fadeUp(0.1)} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {STATS.map((s) => (
                        <div key={s.label} className="bg-surface-elevated border border-border rounded-2xl p-6 text-center hover:border-brand/30 transition-colors">
                            <p className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest mb-2">{s.label}</p>
                            <p className="text-xl font-bold text-foreground mb-1">{s.value}</p>
                            <p className="text-xs text-foreground/50">{s.sub}</p>
                        </div>
                    ))}
                </motion.section>

                <motion.section {...fadeUp(0.15)} className="grid lg:grid-cols-2 gap-14 items-start">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-foreground mb-3">What Synapse does today</h2>
                            <p className="text-foreground/60 leading-relaxed">
                                Synapse gives teams and communities a place to talk — instantly. No downloads, no onboarding checklist, no subscription tiers. Create a room, share the ID, and start the conversation in seconds.
                            </p>
                        </div>
                        <div className="space-y-3">
                            {FEATURES_NOW.map((f) => (
                                <div key={f.text} className="flex items-center gap-3 text-sm text-foreground/70">
                                    <span className="text-brand shrink-0">{f.icon}</span>
                                    {f.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-foreground mb-3">The vision</h2>
                            <p className="text-foreground/60 leading-relaxed">
                                Most chat tools are built for enterprises first and people second. Synapse flips that. The goal is a platform that feels lightweight when you are just chatting with a friend, but scales up gracefully when an entire organization depends on it. Communication should never feel like work.
                            </p>
                        </div>
                        <blockquote className="border-l-2 border-brand pl-4 text-sm italic text-foreground/50">
                            &ldquo;The best tools disappear. You stop thinking about the software and start thinking about the conversation.&rdquo;
                        </blockquote>
                    </div>
                </motion.section>

                <motion.section {...fadeUp(0.2)}>
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-heading font-bold text-foreground mb-2">What is coming next</h2>
                        <p className="text-foreground/60 max-w-xl mx-auto text-sm leading-relaxed">
                            Synapse is actively evolving. Here is where it is heading — these are not just features, they are commitments to building something genuinely useful.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {FUTURE_SCOPE.map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 + i * 0.07 }}
                                className="bg-surface-elevated border border-border rounded-2xl p-5 hover:border-brand/30 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-brand-light rounded-xl text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                                        {item.icon}
                                    </div>
                                    <h3 className="font-semibold text-sm text-foreground">{item.title}</h3>
                                </div>
                                <p className="text-xs text-foreground/60 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                <motion.section {...fadeUp(0.25)} className="grid lg:grid-cols-3 gap-10 items-start">
                    <div className="lg:col-span-1">
                        <div className="bg-surface-elevated border border-border rounded-2xl p-6 text-center">
                            <div className="w-20 h-20 rounded-full bg-brand flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4 shadow-lg shadow-brand/20">
                                S
                            </div>
                            <h3 className="font-heading font-bold text-lg text-foreground">Ankit</h3>
                            <p className="text-sm text-foreground/50 mb-4 mt-1">Developer · Designer · Builder</p>
                            <div className="flex justify-center gap-3">
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                                   className="p-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-foreground/60 hover:text-brand transition-colors">
                                    <Github size={16} />
                                </a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                                   className="p-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-foreground/60 hover:text-brand transition-colors">
                                    <Linkedin size={16} />
                                </a>
                                <a href="mailto:contact@skaeht.dev"
                                   className="p-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-foreground/60 hover:text-brand transition-colors">
                                    <Mail size={16} />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-5">
                        <h2 className="text-2xl font-heading font-bold text-foreground">About the developer</h2>
                        <p className="text-foreground/60 leading-relaxed">
                            Ankit is a full-stack developer with a passion for building tools that solve real problems. Synapse grew out of frustration with chat platforms that were either too bloated for casual use or too simple for anything serious. The goal was always to find the middle ground — something that works beautifully and gets out of the way.
                        </p>
                        <p className="text-foreground/60 leading-relaxed">
                            Every feature in Synapse exists because it solves a genuine pain point: the lag in other platforms, the confusion of managing multiple thread types, the friction of setting up a simple team conversation. Building Synapse has been as much about learning what to leave out as it has been about what to include.
                        </p>
                        <p className="text-foreground/60 leading-relaxed">
                            The developer behind Synapse believes that good software is humble — it does its job, it does it fast, and it does not get in your way. That philosophy guides every decision made while building this platform.
                        </p>
                        <div className="pt-2 flex flex-wrap gap-2">
                            {['Spring Boot', 'Next.js', 'PostgreSQL', 'Redis', 'WebSocket', 'TypeScript', 'Docker', 'Tailwind CSS'].map((tag) => (
                                <span key={tag} className="text-xs font-mono bg-surface-elevated border border-border text-foreground/60 px-2.5 py-1 rounded-lg">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.section>

                <motion.section {...fadeUp(0.3)} className="text-center py-10 border-t border-border">
                    <h2 className="text-2xl font-heading font-bold text-foreground mb-3">Ready to join the conversation?</h2>
                    <p className="text-foreground/60 mb-6 max-w-md mx-auto text-sm">
                        Jump back in, create a room, and share the ID with whoever you want in it.
                    </p>
                    <Link href="/dashboard"
                          className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-brand/25 active:scale-95">
                        <MessageCircle size={16} />
                        Open Synapse
                    </Link>
                </motion.section>

            </main>

            <footer className="border-t border-border py-6 px-6 bg-surface">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-foreground/50">
                    <p className="font-medium">Synapse is developed by <span className="text-brand font-semibold">skaeht</span></p>
                    <p className="font-mono">© 2025 skaeht · All rights reserved</p>
                </div>
            </footer>
        </div>
    );
}