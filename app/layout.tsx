import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: 'aclea - Lead Management',
  description: 'Manage and track your leads efficiently',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} font-sans antialiased`}>
        {children}
        <Analytics />
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var mode = localStorage.getItem('mode');
                var theme = localStorage.getItem('theme');
                if (mode === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-mode', 'dark');
                } else {
                  document.documentElement.setAttribute('data-mode', 'light');
                }
                if (theme) {
                  document.documentElement.setAttribute('data-theme', theme);
                }
              } catch (e) {}
            })();
          `}
        </Script>
      </body>
    </html>
  )
}
