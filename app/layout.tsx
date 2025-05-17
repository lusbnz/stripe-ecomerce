import type { Metadata } from "next";
import "./globals.css";
import "./typo.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { LayoutWithNav } from "@/components/layout-nav";

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
    <html lang="en">
      <body className="flex min-h-full flex-col bg-white">
        <LayoutWithNav>{children}</LayoutWithNav>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
