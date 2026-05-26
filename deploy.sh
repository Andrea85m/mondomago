#!/bin/bash
set -e

TOKEN="$1"
if [ -z "$TOKEN" ]; then
  echo "Uso: bash deploy.sh IL_TUO_TOKEN"
  exit 1
fi

cd /home/andrea/app-educativa-bambini-logica-programmazione

echo "==> Build..."
GITHUB_PAGES=1 npx vite build

echo "==> Preparo cartella temporanea..."
rm -rf /tmp/gh-pages-manual
mkdir /tmp/gh-pages-manual
cp -r dist/. /tmp/gh-pages-manual/

echo "==> Git init..."
git -C /tmp/gh-pages-manual init
git -C /tmp/gh-pages-manual checkout -b gh-pages
git -C /tmp/gh-pages-manual config user.email "afphotographyflickr@gmail.com"
git -C /tmp/gh-pages-manual config user.name "Andrea85m"
git -C /tmp/gh-pages-manual add -A
git -C /tmp/gh-pages-manual commit -m "Deploy MondoMago v1.0.0"

echo "==> Push su GitHub Pages..."
git -C /tmp/gh-pages-manual push --force "https://Andrea85m:${TOKEN}@github.com/Andrea85m/mondomago.git" gh-pages

echo "==> Deploy completato!"
echo "Attiva GitHub Pages: Settings → Pages → Source: gh-pages branch"
