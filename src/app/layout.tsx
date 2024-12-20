import "./globals.css";

export const metadata = {
  title: "Next.js",
  description: "Generated by Next.js",
};

import { Inter } from "next/font/google"
import Navbar from "@/components/NavBar"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] })


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
              <Toaster />
          </div>
      </body>
    </html>
  );
}

