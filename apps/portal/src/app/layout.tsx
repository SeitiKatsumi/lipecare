import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "LipeCare Portal",
  description: "Portal local das aplicacoes LipeCare."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
