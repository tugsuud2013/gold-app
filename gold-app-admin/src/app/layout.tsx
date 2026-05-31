import type { Metadata } from "next";
import { Inter } from "next/font/google";
import QueryProvider from "@/components/providers/QueryProvider";
import ToastProvider from "@/components/ui/ToastProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gold App Admin",
  description: "Алт Апп удирдлагын систем",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 font-sans text-slate-900">
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
