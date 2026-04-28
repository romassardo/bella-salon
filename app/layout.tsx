import type { Metadata, Viewport } from 'next';
import { Inter_Tight, Fraunces, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  axes: ['opsz'],
  style: ['normal', 'italic'],
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: {
    default: 'Salón Bella · Belleza, a un click',
    template: '%s · Salón Bella',
  },
  description:
    'Corte, color, manicure, maquillaje. Reservá online o por Bella, tu asistente virtual. Buenos Aires, AR.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'Salón Bella',
    description: 'Tu lugar de belleza, a un click.',
    locale: 'es_AR',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#F2EDE6',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${interTight.variable} ${fraunces.variable} ${jetbrains.variable}`}>
      <body>
        <div className="grain" aria-hidden />
        {children}
      </body>
    </html>
  );
}
