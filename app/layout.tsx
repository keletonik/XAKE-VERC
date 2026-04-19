import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { env } from "@/lib/config/env";
import "./globals.css";

export const metadata: Metadata = {
  title: "XAKE — trading decision cockpit",
  description:
    "A premium, dark-theme trading decision cockpit. Paper trading, AI assistant, charts, alerts.",
  metadataBase: new URL("https://xake.vercel.app"),
  openGraph: {
    title: "XAKE",
    description: "Premium, dark-theme trading decision cockpit.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const appName = env().NEXT_PUBLIC_APP_NAME;
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head />
      <body className="font-sans">
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only fixed left-2 top-2 z-50 rounded bg-primary px-2 py-1 text-xs text-primary-foreground"
          >
            Skip to content
          </a>
          <div id="main">{children}</div>
          <div className="sr-only" aria-hidden>
            {appName}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
