import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'iRepair Technologies | Wholesale Cell Phone Repair Parts',
  description: 'Premium wholesale iPhone screens, batteries, and repair parts. Sourced direct from China, stocked in Houston, delivered to repair shops across Texas.',
  keywords: 'wholesale cell phone parts, iPhone repair parts, wholesale iPhone screens, repair shop supplies, Houston',
  openGraph: {
    title: 'iRepair Technologies | Wholesale Cell Phone Repair Parts',
    description: 'Premium wholesale iPhone screens, batteries, and repair parts for professional repair shops.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background text-foreground">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}

