import type { Metadata, Viewport } from 'next';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import '@/styles/globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'AI App Builder',
  description: 'Transform natural language into production-ready web applications',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          {children}
          <Toaster position="bottom-right" richColors />
        </ErrorBoundary>
      </body>
    </html>
  );
}
