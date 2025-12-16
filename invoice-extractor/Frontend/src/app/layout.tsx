import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Invoice Extractor - Document Processing",
  description: "Extract and process invoice data automatically",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <div className="min-h-screen flex flex-col">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900">
                    📄 Invoice Extractor
                  </h1>
                </div>
                <nav className="flex space-x-8">
                  <a href="/" className="text-gray-700 hover:text-blue-600 font-medium">
                    Upload
                  </a>
                  <a href="/history" className="text-gray-700 hover:text-blue-600 font-medium">
                    History
                  </a>
                  <a href="/data" className="text-gray-700 hover:text-blue-600 font-medium">
                    Database
                  </a>
                  <a 
                    href="http://localhost:5001/api-docs/" 
                    target="_blank"
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    API Docs
                  </a>
                </nav>
              </div>
            </div>
          </header>
          
          <main className="flex-1 bg-white">
            {children}
          </main>
          
          <footer className="bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="text-center text-sm text-gray-500">
                <p>Invoice Extractor - Case Study Implementation</p>
                <p className="mt-1">
                  Built with Next.js, Flask, SQLite • 
                  <a href="http://localhost:5001" target="_blank" className="text-blue-600 hover:text-blue-800 ml-1">
                    Backend API
                  </a>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}