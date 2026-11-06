import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { BagProvider } from "@/components/bag/BagProvider";
import { BagDrawer } from "@/components/bag/BagDrawer";
import { Ticker } from "@/components/chrome/Ticker";
import { Header } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";
import { MenuSheet, TabBar } from "@/components/chrome/TabBar";
import { Toast } from "@/components/chrome/Toast";
import { RevealObserver } from "@/components/chrome/RevealObserver";
import { getPosts, getSettings } from "@/lib/sanity/data";
import { publicSettings, siteUrl, SEO } from "@/lib/site";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: SEO.home.title, template: "%s" },
  description: SEO.home.description,
  openGraph: {
    type: "website",
    siteName: "Hamley's Tea & Coffee Co.",
    locale: "en_CA",
    title: SEO.home.title,
    description: SEO.home.description,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#2A1D16",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, posts] = await Promise.all([getSettings(), getPosts()]);
  const hasPosts = posts.length > 0;
  const clientSettings = publicSettings(settings);
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <BagProvider settings={clientSettings} hasPosts={hasPosts}>
          <Ticker />
          <Header />
          <main id="main">{children}</main>
          <Footer settings={clientSettings} hasPosts={hasPosts} />
          <TabBar />
          <MenuSheet />
          <BagDrawer />
          <Toast />
        </BagProvider>
        <RevealObserver />
        <Analytics />
      </body>
    </html>
  );
}
