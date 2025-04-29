import type { Metadata } from "next";
import { Funnel_Sans } from "next/font/google";
import "./globals.css";


const funnelSans = Funnel_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-funnel-sans",
});

export const metadata: Metadata = {
  title: "File Downloader",
  description: "A simple and efficient tool to download files from various sources",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${funnelSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
