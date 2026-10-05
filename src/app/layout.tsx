import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.arturdiasfotografia.com.br'),
  icons: {
    icon: '/artur_perfil.jpg',
    apple: '/artur_perfil.jpg',
  },
  openGraph: {
    images: ['/artur_perfil.jpg'],
  },
}

import { ViewTransitions } from 'next-view-transitions'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ViewTransitions>
      <html lang="pt-BR">
        <body style={{ margin: 0, padding: 0 }}>{children}</body>
      </html>
    </ViewTransitions>
  )
}
