import type { Metadata } from "next";
import { Fraunces, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
};

/**
 * Runs before first paint so a returning reader never sees the default palette
 * flash before theirs. Also accepts ?palette=&theme=&layout= so a particular
 * look can be linked to directly. Kept deliberately tiny and dependency-free.
 */
const themeBoot = `(function(){try{var d=document.documentElement;var s=localStorage;
var q=new URLSearchParams(location.search);
['palette','theme','layout'].forEach(function(k){var v=q.get(k);if(v){s.setItem('ap-'+k,v);}});
var p=s.getItem('ap-palette');var l=s.getItem('ap-layout');var t=s.getItem('ap-theme');
if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
d.setAttribute('data-palette',p||'ink');d.setAttribute('data-layout',l||'editorial');d.setAttribute('data-theme',t);
}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-palette="ink"
      data-theme="light"
      data-layout="editorial"
      suppressHydrationWarning
      className={`${fraunces.variable} ${newsreader.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <a
          href="#main"
          className="label sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-accent focus:text-accent-contrast focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
