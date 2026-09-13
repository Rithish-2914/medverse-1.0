import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MEDVERSE — Diagnose the Constraint. Prescribe the Innovation.",
  description: "A cross-domain medtech build event by The Medtech Innovators Club, VIT Vellore. Three tracks. Real patients. Sealed kits.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}