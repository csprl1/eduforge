// app/layout.tsx
import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "EduForge — AI-Powered Learning Platform",
    template: "%s | EduForge",
  },
  description:
    "Master modern skills with AI-powered courses, instant quizzes, and expert instructors. Build. Learn. Forge your future.",
  keywords: ["learning", "education", "courses", "AI", "edtech"],
  authors: [{ name: "EduForge" }],
  openGraph: {
    title: "EduForge — AI-Powered Learning Platform",
    description: "Master modern skills with AI-powered learning.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${syne.variable} ${jetbrains.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
