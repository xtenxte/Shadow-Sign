import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css"; // Load CSS first
import "@/lib/global-polyfill"; // Polyfill global before other components
import { Web3Provider } from "@/components/providers/web3-provider";
import { FhevmProvider } from "@/components/providers/fhevm-provider";

const displaySans = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const displayMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Shadow Sign | Encrypted Man vs Machine Duel",
  description:
    "Shadow Sign is a neon-drenched strategy duel where every move stays encrypted until you decrypt the outcome.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body
        className={`${displaySans.variable} ${displayMono.variable} antialiased`}
      >
        <Web3Provider>
          <FhevmProvider>{children}</FhevmProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
