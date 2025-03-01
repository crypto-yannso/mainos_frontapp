import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Définition des variables CSS pour simuler Geist
const fontVariables = {
  "--font-geist-sans": "var(--font-inter)",
  "--font-geist-mono": "monospace",
};

export const metadata: Metadata = {
  title: "MainOS",
  description: "Interface système MainOS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head />
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
