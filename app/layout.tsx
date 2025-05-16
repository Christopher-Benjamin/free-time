import './globals.css';
import type { Metadata } from 'next';
import Header from './components/Header';
import Footer from './components/Footer';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Free Time Finder',
  description: 'Schedule your free time with friends',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <Providers>
          <main className="flex-grow">
            {children}
          </main>
        </Providers>
        <Footer />
      </body>
    </html>
  );
} 