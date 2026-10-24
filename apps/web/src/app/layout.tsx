import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/styles/globals.css";

/*
 * Inter is loaded here and exposed as --font-inter, which is what the generated
 * --font-sans token in @janmaang/tokens points at. Changing the typeface is a
 * two-line change: this import and the token.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "JanMaang — Jharkhand's Societal Innovation OS",
    template: "%s · JanMaang",
  },
  description:
    "A civic demand-to-budget platform. Citizens report a local need; students, institutions and industry turn it into funded, verified work.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${inter.variable} h-full antialiased`} lang="en">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
