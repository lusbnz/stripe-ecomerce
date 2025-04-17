import type { Metadata } from "next";
import "./globals.css";
import "./typo.css";
import { Navbar } from "@/components/navbar";
import { ClerkProvider } from "@clerk/nextjs";
import { Footer } from "@/components/footer";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: "MyStore",
  description: "Buy cool products",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="flex min-h-full flex-col bg-white">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
