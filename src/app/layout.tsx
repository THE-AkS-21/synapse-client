import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
    title: 'Synapse | Enterprise Chat',
    description: 'Highly responsive, modern real-time chat application',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body
            suppressHydrationWarning
            className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground selection:bg-brand/30 transition-colors duration-300`}
        >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}

            {/* Dynamic Toaster Styling based on CSS variables */}
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: 'var(--surface-elevated)',
                        color: 'var(--foreground)',
                        border: '1px solid var(--border)'
                    }
                }}
            />
        </ThemeProvider>
        </body>
        </html>
    );
}