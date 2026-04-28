import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "LipeCare",
  description: "Acompanhamento clinico humanizado para pacientes com lipedema."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

