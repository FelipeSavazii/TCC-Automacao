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
  title: "Life · Totem HTO | Governança Estudantil",
  description:
    "Esqueça o celular. Você não precisa dele. O Totem HTO é um hub físico que substitui o smartphone no ambiente escolar, entregando cronogramas e presença automatizada via leitura óptica da carteirinha.",
  authors: [
    { name: "Felipe Savazi" },
    { name: "Julia Moreira" },
    { name: "Lara Moreira" },
    { name: "Laura Vitoria" },
  ],
  keywords: [
    "Life",
    "Totem HTO",
    "Governança Escolar",
    "Automação Industrial",
    "IoT",
    "Engenharia Frugal",
    "Raspberry Pi",
    "TCC",
  ],
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
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}