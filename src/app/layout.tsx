import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StagewiseToolbar } from "@stagewise/toolbar-next";
import { ReactPlugin } from "@stagewise-plugins/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gal Agent - AI Assistant",
  description: "Intelligent AI assistant with web search, scraping, memory, and calculation capabilities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
        {children}
      </body>
    </html>
  );
}
