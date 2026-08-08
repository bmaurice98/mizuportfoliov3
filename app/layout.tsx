import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Providers } from "./providers";
import { CursorLayer } from "./CursorLayer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dev Mizu - Portfolio",
  description: "Portfolio website of Brandon Maurice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* <!-- Google Fonts: Inter, Montserrat, Geist --> */}
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600&amp;family=Inter:wght@400&amp;family=Montserrat:wght@500;600;700&amp;display=swap"
          rel="stylesheet"
        />
        {/* <!-- Material Symbols --> */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="bg-background text-on-background font-body-md text-body-md min-h-screen relative overflow-x-hidden selection:bg-secondary-container selection:text-primary pt-20">
        <Providers>
          <CursorLayer />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
