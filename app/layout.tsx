import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Geist_Mono, Manrope } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

import { Providers } from '@/app/providers'

import './globals.css'

const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['500', '600', '700'],
})

const uiFont = Manrope({ subsets: ['latin'], variable: '--font-manrope' })
const dataFont = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'OTI - Sistema de Gestión Operacional',
  description: 'Gestión de tareas operacionales para Oleoducto Trasandino',
  generator: 'v0.app',
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f2ea' },
    { media: '(prefers-color-scheme: dark)', color: '#12151a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${displayFont.variable} ${uiFont.variable} ${dataFont.variable}`}
    >
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
