import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { themeCss } from '@alta/design-tokens';
import { env } from '@/env';

export const metadata: Metadata = {
  title: 'Alta Admin',
  description: 'Alta Universe operator console — content, catalogue, and aggregated analytics.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  void env;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600&family=Hanken+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style id="alta-theme" dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
