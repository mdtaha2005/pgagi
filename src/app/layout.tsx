import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/store/provider';
import { Toast } from '@/components/ui/Toast';
import { PreferencesModal } from '@/components/modals/PreferencesModal';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { ContentDetailModal } from '@/components/modals/ContentDetailModal';

export const metadata: Metadata = {
  title: 'PulseFeed | Personalized Content Dashboard',
  description:
    'An interactive, multi-source content dashboard delivering personalized news, media recommendations, and real-time social streams.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
        <StoreProvider>
          {children}
          <PreferencesModal />
          <ProfileModal />
          <ContentDetailModal />
          <Toast />
        </StoreProvider>
      </body>
    </html>
  );
}
