import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MEDVERSE — Diagnose the Constraint. Prescribe the Innovation.",
  description: "A cross-domain medtech build event by The Medtech Innovators Club, VIT Vellore. Three tracks. Real patients. Sealed kits.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
