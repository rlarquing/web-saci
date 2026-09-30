#!/usr/bin/env bash
# Inicia el dev server con todo el I/O en RAM (Linux).
set -euo pipefail

PROJECT="web-sacp"
RAMDIR="/dev/shm/next-dev/$PROJECT"
JUNCTION=".next-fast"

# Crear carpeta en RAM
mkdir -p "$RAMDIR"

# Symlink de node_modules dentro del RAMDIR para resolver dependencias
if [ -L "$RAMDIR/node_modules" ] || [ -d "$RAMDIR/node_modules" ]; then
  rm -rf "$RAMDIR/node_modules"
fi
ln -sf "$(pwd)/node_modules" "$RAMDIR/node_modules"

# Symlink .next-fast -> /dev/shm/next-dev/web-sacp
if [ -L "$JUNCTION" ] || [ -d "$JUNCTION" ]; then
  rm -rf "$JUNCTION"
fi
ln -sf "$RAMDIR" "$JUNCTION"

# Cache de compilación a RAM
CACHE_DIR="/dev/shm/next-cache"
mkdir -p "$CACHE_DIR"
export NEXT_COMPUTE_CACHE_DIR="$CACHE_DIR"

echo "distDir symlink -> $RAMDIR (RAM)"
echo "node_modules symlink -> RAM (para resolver dependencias)"
echo "NEXT_COMPUTE_CACHE_DIR -> $CACHE_DIR (RAM)"
echo "Proyecto: $(pwd)"

npx next dev -p 4000 --turbopack
