$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..\preview")
$port = if ($env:PORT) { [int]$env:PORT } else { 3000 }

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
$listener.Start()

Write-Host "LipeCare preview listening on http://localhost:$port/"

function Get-ContentType {
    param([string]$Path)

    switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
        ".html" { "text/html; charset=utf-8" }
        ".css" { "text/css; charset=utf-8" }
        ".js" { "application/javascript; charset=utf-8" }
        ".png" { "image/png" }
        ".jpg" { "image/jpeg" }
        ".jpeg" { "image/jpeg" }
        ".svg" { "image/svg+xml" }
        default { "application/octet-stream" }
    }
}

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()

        try {
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
            $requestLine = $reader.ReadLine()

            if ([string]::IsNullOrWhiteSpace($requestLine)) {
                $client.Close()
                continue
            }

            $parts = $requestLine.Split(" ")
            $rawPath = if ($parts.Count -gt 1) { $parts[1] } else { "/" }

            while ($true) {
                $line = $reader.ReadLine()
                if ($null -eq $line -or [string]::IsNullOrEmpty($line)) { break }
            }

            $pathOnly = $rawPath.Split("?")[0].TrimStart("/")
            if ([string]::IsNullOrWhiteSpace($pathOnly)) {
                $pathOnly = "index.html"
            }

            $relativePath = [Uri]::UnescapeDataString($pathOnly).Replace("/", "\")
            $target = [System.IO.Path]::GetFullPath((Join-Path $root $relativePath))
            $rootPath = [System.IO.Path]::GetFullPath($root)

            if (-not $target.StartsWith($rootPath, [System.StringComparison]::OrdinalIgnoreCase) -or
                -not (Test-Path -LiteralPath $target -PathType Leaf)) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("Not found")
                $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
                $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                $stream.Write($headerBytes, 0, $headerBytes.Length)
                $stream.Write($body, 0, $body.Length)
                $client.Close()
                continue
            }

            $bytes = [System.IO.File]::ReadAllBytes($target)
            $contentType = Get-ContentType -Path $target
            $responseHeader = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n"
            $responseHeaderBytes = [System.Text.Encoding]::ASCII.GetBytes($responseHeader)

            $stream.Write($responseHeaderBytes, 0, $responseHeaderBytes.Length)
            $stream.Write($bytes, 0, $bytes.Length)
            $client.Close()
        }
        catch {
            $client.Close()
            Write-Error $_
        }
    }
}
finally {
    $listener.Stop()
}
