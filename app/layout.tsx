//ovibase/app/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "OviBase – Church Administration Made Simple",
  description:
    "Manage members, attendance, finance and bulk SMS in one secure workspace with role-based access.",
  metadataBase: new URL("https://ovibase.com"),

  openGraph: {
    title: "OviBase – Church Administration Made Simple",
    description:
      "Manage members, attendance, finance and bulk SMS in one secure workspace.",
    url: "https://ovibase.com",
    siteName: "OviBase",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OviBase",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "OviBase – Church Administration Made Simple",
    description:
      "Manage members, attendance, finance and bulk SMS in one secure workspace.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
