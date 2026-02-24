import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "CryptoPulse Admin",
  description: "CryptoPulse Predict Bot admin dashboard"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}

