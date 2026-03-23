import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { StudyProvider } from "@/context/StudyContext";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kids Study Lab",
  description: "Fun AI-powered lessons and quizzes for elementary learners",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e9d5ff" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1b4b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} font-sans min-h-dvh antialiased`}
      >
        <StudyProvider>{children}</StudyProvider>
      </body>
    </html>
  );
}
