$ssdRoot = "C:\dev-cache\web-sacp"
$ssdNodeModules = "$ssdRoot\node_modules"
$projectNodeModules = Join-Path $PWD "node_modules"
$junction = Join-Path $PWD ".next-fast"

# Crear carpeta base en SSD
New-Item -ItemType Directory -Path $ssdRoot -Force | Out-Null

# Junction de node_modules para que los chunks compilados encuentren dependencias
if (Test-Path $ssdNodeModules) {
  Remove-Item -Path $ssdNodeModules -Force -Recurse
}
New-Item -ItemType Junction -Path $ssdNodeModules -Target $projectNodeModules | Out-Null

# Junction .next-fast -> C:\dev-cache\web-sacp
if (Test-Path $junction) {
  Remove-Item -Path $junction -Force -Recurse
}
New-Item -ItemType Junction -Path $junction -Target $ssdRoot | Out-Null

# Cache de compilación al SSD
$cacheDir = "C:\dev-cache\next-cache"
if (-not (Test-Path $cacheDir)) {
  New-Item -ItemType Directory -Path $cacheDir -Force | Out-Null
}
$env:NEXT_COMPUTE_CACHE_DIR = $cacheDir

Write-Host "distDir junction -> $ssdRoot (SSD)" -ForegroundColor Green
Write-Host "node_modules junction -> SSD (para resolver dependencias)" -ForegroundColor Green
Write-Host "NEXT_COMPUTE_CACHE_DIR -> $cacheDir (SSD)" -ForegroundColor Green
Write-Host "Proyecto: $PWD" -ForegroundColor Cyan

npx next dev -p 4000 --turbopack
