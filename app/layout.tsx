import type { Metadata } from 'next'
import { DM_Sans, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: 'aclea - Lead Management',
  description: 'Manage and track your leads efficiently',
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
    <html lang="de" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var m=localStorage.getItem('mode'),t=localStorage.getItem('theme');if(m==='dark'||(m!=='light'&&t==='dark')){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-mode','dark');document.documentElement.style.background='#030303';document.documentElement.style.colorScheme='dark';}else{document.documentElement.setAttribute('data-mode','light');document.documentElement.style.background='#F5F5F4';}if(t){document.documentElement.setAttribute('data-theme',t);}}catch(e){}` }} />
      </head>
      <body className={`${dmSans.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" richColors />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}