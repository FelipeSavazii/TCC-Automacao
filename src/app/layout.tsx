import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
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
        {children}
      </body>
    </html>
  );
}