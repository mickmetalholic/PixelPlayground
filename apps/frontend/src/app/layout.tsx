import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { TrpcProvider } from '@/trpc/provider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PixelPlayground',
  description: 'Creative operations workspace for game data and content flows.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TrpcProvider>{children}</TrpcProvider>
      </body>
    </html>
  );
}
