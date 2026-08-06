import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "LipeCare",
  description: "Acompanhamento clínico humanizado para pacientes com lipedema."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

