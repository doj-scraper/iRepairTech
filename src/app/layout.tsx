import type { Metadata, Viewport } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MobileFooterNav } from '@/components/MobileFooterNav';
import { publicConfig } from '@/lib/config/public';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(publicConfig.NEXT_PUBLIC_SITE_URL),
  title: 'iRepair Technologies | Wholesale Cell Phone Repair Parts',
  description:
    'Premium wholesale cellphone repair parts for professional shops. Houston-stocked screens, batteries, and components with operational-grade fulfillment.',
  keywords: 'wholesale cell phone parts, iPhone repair parts, wholesale iPhone screens, repair shop supplies, Houston',
  openGraph: {
    title: 'iRepair Technologies | Wholesale Cell Phone Repair Parts',
    description:
      'Premium wholesale cellphone repair parts for professional repair shops. Houston-stocked inventory with trade account access, Stripe checkout, and operational dispatch workflows.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#101A2A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background pb-[calc(5.75rem+env(safe-area-inset-bottom))] text-foreground antialiased md:pb-0">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <MobileFooterNav />
        <Toaster />
      </body>
    </html>
  );
}
