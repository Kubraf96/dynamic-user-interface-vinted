import { Arimo, Fraunces, Geist, Geist_Mono, Inter } from "next/font/google";
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

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Display font for "Året der gik" (uses the WONK/SOFT axes like the Figma design)
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK"],
});

const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
});

export const metadata = {
  title: "Dynamic User Interface Examen - Vinted App",
  description: "A school project for the Dynamic User Interface course, simulating a Vinted-like application made memorable without breaking it.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${fraunces.variable} ${arimo.variable}`}>
      <body>
        <LoadingScreen />
        <Header title="Mine ordrer" showArrow />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
