import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { themeCss } from '@alta/design-tokens';
import { env } from '@/env';

export const metadata: Metadata = {
  title: 'Alta Universe',
  description:
    'A human-centered personal intelligence and lifestyle ecosystem: understand, express, and care for yourself.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Validate environment at startup; invalid config fails fast.
  void env;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Hanken+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Design tokens injected as the single source of truth for theming. */}
        <style id="alta-theme" dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
