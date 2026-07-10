import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Project NW", description: "x" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full min-h-full antialiased" style={{fontFamily: 'Inter, sans-serif'}}>{children}</body>
    </html>
  );
}
