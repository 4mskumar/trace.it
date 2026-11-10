import Providers from "@/components/Providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Trace.it",
  description: "Analyze your repositories",
icons: '/image/title logo.png'
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // `dark` switches all shadcn tokens (including --sidebar-*) to the dark theme
    <html lang="en" className={`${inter.className} dark h-full antialiased`}>
      <body className="min-h-svh bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}