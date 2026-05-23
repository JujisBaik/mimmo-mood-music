import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MiMo Mood Music Generator - Free Voice',
  description: 'Bikin lagu sesuai mood kamu dengan melody dan browser voice gratis.',
  keywords: ['MiMo', 'Mood Music', 'AI Music', 'Xiaomi MiMo', 'Web Speech API'],
  authors: [{ name: 'Jumjis' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
