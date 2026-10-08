import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3DA — оживи поделку",
  description: "Веб-приложение, где детские поделки превращаются в 3D-персонажей.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
