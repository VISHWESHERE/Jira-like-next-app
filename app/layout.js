// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/app/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata = {
  title: "TaskFlow - Project Management",
  description: "A modern kanban board for project management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}