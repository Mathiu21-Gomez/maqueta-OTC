import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

import { Providers } from '@/app/providers'

import './globals.css'

const sansFont = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

const monoFont = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'OTC Boardroom · Gestión operacional',
    template: '%s · OTC Boardroom',
  },
  description:
    'Plataforma de gestión operacional de Oleoducto Trasandino. Coordinación de tareas, seguimiento de cartera y visibilidad entre áreas.',
  applicationName: 'OTC Boardroom',
  authors: [{ name: 'Oleoducto Trasandino' }],
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f7f2ea',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${sansFont.variable} ${monoFont.variable}`}
    >
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
