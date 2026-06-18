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
  title: "Totem HTO | Governança Escolar",
  description: "Hub físico de inteligência distribuída para acesso a cronogramas e gestão de presença, eliminando a dependência de smartphones no campus.",
  authors: [{ name: "Equipe de Automação Industrial" }],
  keywords: ["Governança Escolar", "Automação", "IoT", "Tecnologia Frugal"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50">{children}</body>
    </html>
  );
}