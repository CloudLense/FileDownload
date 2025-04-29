import type { Metadata } from "next";
import { Funnel_Sans } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const funnelSans = Funnel_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-funnel-sans",
});

export const metadata: Metadata = {
  title: "File Downloader",
  description: "A simple and efficient tool to download files from various sources",
  other: {
    'google-adsense-account': 'ca-pub-1582802394629250',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1582802394629250"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-CRDP95RP1X"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CRDP95RP1X');
          `}
        </Script>
      </head>
      <body
        className={`${funnelSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
