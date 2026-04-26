import type { Metadata } from "next";
import { Be_Vietnam_Pro, Epilogue } from "next/font/google";
import "./globals.css";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  display: "swap",
});

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AIroma | Crave & Discover",
  description: "AI-powered restaurant discovery (Next.js)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light scroll-smooth">
      <body
        className={`${epilogue.variable} ${beVietnam.variable} bg-background text-on-background`}
      >
        {children}
      </body>
    </html>
  );
}
