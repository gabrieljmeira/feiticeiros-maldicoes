import type { Metadata } from 'next';
import { Inter, Rajdhani, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const rajdhani = Rajdhani({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-rajdhani' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Feiticeiros & Maldições v2.5 — Fichas & Escudo do Mestre',
  description: 'Criador de fichas automatizado e painel em tempo real para Feiticeiros & Maldições 2.5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${rajdhani.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen antialiased selection:bg-accent selection:text-accent-fg">
        {children}
      </body>
    </html>
  );
}
