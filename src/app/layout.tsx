import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SITE_ORIGIN } from "@/lib/data";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "Michigan Menopause Collaborative",
    template: "%s · Michigan Menopause Collaborative",
  },
  description:
    "A multidisciplinary network for clinicians caring for women in midlife in southeast Michigan. Four meetings a year. One focused topic. One article. A real case discussion.",
  openGraph: {
    title: "Michigan Menopause Collaborative",
    description:
      "A multidisciplinary network for clinicians caring for women in midlife in southeast Michigan.",
    type: "website",
    url: SITE_ORIGIN,
    siteName: "Michigan Menopause Collaborative",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${plexMono.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
