import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
    title: 'SACI — Control de Inventarios con QR',
    description: 'Panel web del Sistema Automatizado de Control de Inventarios usando QR',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'SACI',
    },
    icons: {
        icon: [
            { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
            { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        ],
        apple: { url: '/icon-180x180.png', sizes: '180x180', type: 'image/png' },
    },
}

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#13316b' },
    ],
    width: 'device-width',
    initialScale: 1,
}

export default function RootLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <html lang='es'>
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
