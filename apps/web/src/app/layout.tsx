import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppContextProvider } from "../context/AppContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AssetFlow - Enterprise Asset & Resource Management",
  description: "Simplify and digitize tracking, allocation, and maintenance of physical assets and shared resources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <AppContextProvider>
          {children}
        </AppContextProvider>
      </body>
    </html>
  );
}
