import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QLK Ticket Dashboard — Tổng quan Điều hành",
  description: "Bức tranh rủi ro vận hành cho hệ thống ticket QLK",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto:wght@400;500;700&family=Roboto+Mono&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
