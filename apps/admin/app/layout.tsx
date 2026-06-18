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
        <style id="alta-theme" dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
