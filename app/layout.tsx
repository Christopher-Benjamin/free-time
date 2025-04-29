import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Time Scheduler',
  description: 'Schedule your free time with friends',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 