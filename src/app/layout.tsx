import React from 'react';
import type { Metadata, Viewport } from 'next';

import { Providers } from '../providers/Providers';

export const metadata: Metadata = {
  title: 'Marek Kustosz - MITAX Consulting sp. z o.o.',
  description: 'Marek Kustosz i MITAX Consulting sp. z o.o. - informacje kontaktowe',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <link rel="stylesheet" href="/styles/index.css" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
