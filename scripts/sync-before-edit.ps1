param(
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git não encontrado no PATH."
}

$repoRoot = git rev-parse --show-toplevel
Set-Location $repoRoot

$dirty = git status --porcelain
if ($dirty) {
  Write-Host "Há alterações locais não salvas. Faça commit ou stash antes de sincronizar:" -ForegroundColor Yellow
  git status --short
  exit 1
}

Write-Host "Sincronizando $Branch com GitHub..." -ForegroundColor Cyan
git fetch origin
git switch $Branch
git pull --rebase origin $Branch

Write-Host "Projeto atualizado. Pode começar a editar." -ForegroundColor Green
