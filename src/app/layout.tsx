import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Booking",
  description: "B2B appointment booking platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
