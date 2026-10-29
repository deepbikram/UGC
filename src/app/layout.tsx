import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSettings, safeColor } from "@/lib/settings";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const name = s.portal_name || BRAND.name;
  return {
    title: { default: `${name} · Creator Portal`, template: `%s · ${name}` },
    description: s.portal_tagline || BRAND.description,
    icons: { icon: "/brand/favicon.svg" },
    openGraph: { title: `${name} · Creator Portal`, description: s.portal_tagline || BRAND.description, images: ["/brand/og.jpg"] },
  };
}

/** #rrggbb → "r, g, b", so the accent can drive the soft/glow variants too. */
function rgbTriplet(hex: string): string {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(", ");
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const accent = safeColor(s.accent_color || "", BRAND.colors.accent);
  const rgb = rgbTriplet(accent);

  return (
    <html lang="en">
      <head>
        <style
          // The one runtime-themeable token: everything accent-coloured derives from it.
          dangerouslySetInnerHTML={{
            __html: `:root{--accent:${accent};--accent-soft:rgba(${rgb},0.12);--accent-glow:rgba(${rgb},0.30);}`,
          }}
        />
      </head>
      <body className={`${sans.variable} ${mono.variable} antialiased`}>{children}</body>
    </html>
  );
}
