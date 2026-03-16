import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RoomAI — AI Interior Design Proposals",
  description:
    "Upload a photo of any room and get 3 professional interior design concepts with color palettes and budget estimates — powered by GPT-4o.",
  openGraph: {
    title: "RoomAI — AI Interior Design Proposals",
    description:
      "Upload a photo of any room and get 3 professional interior design concepts with color palettes and budget estimates.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
