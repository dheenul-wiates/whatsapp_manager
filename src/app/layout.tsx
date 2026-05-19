import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "WhatsApp SaaS",
  description: "Modern SaaS dashboard for WhatsApp templates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SidebarLayout>
          {children}
        </SidebarLayout>
        <Toaster />
      </body>
    </html>
  );
}
