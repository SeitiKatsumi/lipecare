$ErrorActionPreference = "Stop"

$server = Join-Path $PSScriptRoot "serve-preview.mjs"
& node $server
