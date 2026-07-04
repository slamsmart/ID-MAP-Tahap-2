$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$env:MAYAR_API_KEY = (Select-String -Path (Join-Path $root ".env.local") -Pattern '^MAYAR_API_KEY=(.*)$').Matches[0].Groups[1].Value
npx -y mayar@latest whoami --json
npx -y mayar@latest qrcode 50000 --json
