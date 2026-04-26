import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shared Todo",
  description: "Everyone sees the same list. No login needed.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
