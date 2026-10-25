import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Funnel_Sans } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const funnelSans = Funnel_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-funnel-sans",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["wdth", "opsz"],
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dwnld.in"),
  title: "dwnld.in · Save videos & photos from Instagram, TikTok, X, LinkedIn, YouTube",
  description:
    "Paste a link and save the video or photo. Works with Instagram reels, TikTok (no watermark), X / Twitter, LinkedIn and YouTube. Free, no sign-up, plus an iPhone share-sheet Shortcut.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "dwnld.in",
    description: "Save any video or photo from Instagram, TikTok, X, LinkedIn and YouTube.",
    url: "https://dwnld.in",
    siteName: "dwnld.in",
  },
  other: {
    'google-adsense-account': 'ca-pub-1582802394629250',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eceef6" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0a24" },
  ],
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
        className={`${funnelSans.variable} ${bricolage.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
