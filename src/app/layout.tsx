import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/src/components/landingPage/Footer"; // Footer компонентын замыг төслийн бүтцээс хамааруулан шалгана уу
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
  title: "Open Data CRM",
  description: "Үйлчлүүлэгчийн бүртгэлийн систем",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col justify-between">
        {/* Үндсэн контент */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>

        {/* Бүх хуудсанд харагдах Footer */}
        <Footer />
      </body>
    </html>
  );
}