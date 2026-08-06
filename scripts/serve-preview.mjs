import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, isAbsolute, normalize, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDirectory, "..", "preview");
const port = Number(process.env.PORT || 3000);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

function safeTarget(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl || "/", "http://localhost").pathname);
  const requested = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const target = resolve(root, normalize(requested));
  const pathFromRoot = relative(root, target);
  if (pathFromRoot.startsWith(`..${sep}`) || pathFromRoot === ".." || isAbsolute(pathFromRoot)) return null;
  return target;
}

const server = createServer(async (request, response) => {
  const target = safeTarget(request.url);
  if (!target) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Acesso negado");
    return;
  }

  try {
    const file = await stat(target);
    if (!file.isFile()) throw new Error("Arquivo inválido");
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Length": file.size,
      "Content-Type": contentTypes[extname(target).toLowerCase()] || "application/octet-stream"
    });
    createReadStream(target).pipe(response);
  } catch {
    const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
    if ((request.method === "GET" || request.method === "HEAD") && !extname(pathname)) {
      const fallback = resolve(root, "index.html");
      const file = await stat(fallback);
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Length": file.size,
        "Content-Type": contentTypes[".html"]
      });
      if (request.method === "HEAD") response.end();
      else createReadStream(fallback).pipe(response);
      return;
    }
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Não encontrado");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`LipeCare preview disponível em http://localhost:${port}/`);
});
