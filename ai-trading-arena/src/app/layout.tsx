import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vivy – Turn Your Trading Ideas Into AI Agents",
  description: "The first platform for Vibe Investing. Describe your strategy in plain English or upload a research paper. Vivy builds, tests, and runs it for you.",
  keywords: ["AI trading", "vibe investing", "trading agents", "no-code trading", "algorithmic trading", "paper trading", "AI finance"],
  openGraph: {
    title: "Vivy – Turn Your Trading Ideas Into AI Agents",
    description: "After Vibe Coding comes Vibe Investing. Create AI trading agents with plain English. No code required.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vivy – Turn Your Trading Ideas Into AI Agents",
    description: "After Vibe Coding comes Vibe Investing. Create AI trading agents with plain English.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${jetbrainsMono.variable} ${outfit.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
