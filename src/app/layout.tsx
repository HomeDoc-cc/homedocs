import { Inter } from 'next/font/google';

import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { Providers } from '@/components/providers';
import { ThemeProvider } from '@/contexts/theme-context';
import { QueryProvider } from '@/providers/query-provider';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HomeDocs',
  description: 'Document and manage your home',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HomeDocs',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'system';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}

              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                      console.log('ServiceWorker registration successful');
                    })
                    .catch(err => {
                      console.log('ServiceWorker registration failed: ', err);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <QueryProvider>
            <ThemeProvider>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
                <Navbar />
                <main className="flex-grow">{children}</main>
                <Footer />
              </div>
            </ThemeProvider>
          </QueryProvider>
        </Providers>
      </body>
    </html>
  );
}
