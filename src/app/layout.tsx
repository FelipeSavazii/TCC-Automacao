import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { TotemShortcut } from "@/components/TotemShortcut";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Life · Totem HTO | Avisos Escolares em Tempo Real",
  description:
    "Esqueça o celular. O Life · Totem HTO é um totem físico operado por botões dedicados no ESP32 que entrega avisos escolares em tempo real no IFSP Hortolândia.",
  authors: [
    { name: "Felipe Savazi" },
    { name: "Julia Moreira" },
    { name: "Lara Moreira" },
    { name: "Laura Vitoria" },
  ],
  keywords: [
    "Life",
    "Totem HTO",
    "Avisos Escolares",
    "Automação Industrial",
    "ESP32",
    "MongoDB",
    "IoT",
    "TCC",
    "IFSP",
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
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TotemShortcut />
        {children}
      </body>
    </html>
  );
}
