import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import LoadingScreen from "@/components/LoadingScreen";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Supabase Auth",
  description: "A Next.js app with sign up, log in and a protected profile page using Supabase Auth",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <LoadingScreen />
        <Header />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
