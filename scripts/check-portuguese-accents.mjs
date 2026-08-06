import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const sources = [
  resolve(root, "preview/index.html"),
  resolve(root, "apps/web/src"),
  resolve(root, "apps/portal/src")
];
const extensions = new Set([".html", ".js", ".jsx", ".ts", ".tsx"]);
const forbiddenWords = [
  "acoes", "adesao", "administracao", "aplicacao", "aplicacoes", "aparencia", "apos",
  "atencao", "atualizacao", "atualizacoes", "avaliacao", "avaliacoes",
  "bracos", "clinica", "clinico", "clinicos", "codigo", "comecou", "critico",
  "condicao", "configuracoes", "conteudos", "cronica", "decisao",
  "devera", "duracao", "duvidas", "evolucao", "experiencia", "ficticias",
  "ficticios", "fundacao", "gestao", "habitos", "historico", "inchaco",
  "disponivel", "estaveis", "informacoes", "inicio", "integracao", "integracoes", "ja", "medica", "medico", "nivel",
  "modulo", "modulos", "mudanca", "mudancas", "nao", "observacoes", "ola",
  "operacao", "orientacoes", "pagina", "pendencia", "pendencias", "periodo", "portugues",
  "preferencias", "producao", "propria", "proprio", "proxima", "proximas",
  "proximo", "proximos", "prontuario", "responsavel", "saude", "seguranca",
  "sao", "tendencia", "temporaria", "titulo", "ultima", "ultimas", "ultimo", "ultimos", "urgencia",
  "usuario", "visao", "voce"
];

function collect(path) {
  if (statSync(path).isFile()) return extensions.has(extname(path)) ? [path] : [];
  return readdirSync(path).flatMap((entry) => collect(join(path, entry)));
}

const files = sources.flatMap(collect);
const failures = [];

for (const file of files) {
  const content = readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);
  let insideTranslationCatalog = false;

  lines.forEach((line, index) => {
    if (line.includes("accent-check: translations-start")) insideTranslationCatalog = true;

    if (/[�]|Ã.|Â./u.test(line)) {
      failures.push(`${relative(root, file)}:${index + 1}: possível texto com codificação corrompida`);
    }

    if (!insideTranslationCatalog && !line.includes("accent-check: technical-token")) {
      for (const word of forbiddenWords) {
        const match = line.match(new RegExp(`\\b${word}\\b`, "i"));
        if (match) failures.push(`${relative(root, file)}:${index + 1}: "${match[0]}" precisa de acentuação`);
      }
    }

    if (line.includes("accent-check: translations-end")) insideTranslationCatalog = false;
  });
}

if (failures.length) {
  console.error("\nErros de acentuação encontrados:\n");
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  console.error("\nCorrija os textos antes de continuar.\n");
  process.exit(1);
}

console.log(`Acentuação validada em ${files.length} arquivos de interface.`);
