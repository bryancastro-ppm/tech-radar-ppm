import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HeroUIProvider } from "@/core/provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tech Radar - Frontend",
  description: "Tech Radar de Herramientas Frontend para el chapter de Membresías",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <HeroUIProvider>{children}</HeroUIProvider>
      </body>
    </html>
  );
}
