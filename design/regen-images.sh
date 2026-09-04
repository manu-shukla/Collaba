#!/usr/bin/env bash
# Rasterises the SVG sources in design/ into the PNGs that index.html references.
# macOS only: uses QuickLook (qlmanage) to rasterise and sips to crop.
# Run from the repo root:  bash design/regen-images.sh
set -euo pipefail

cd "$(dirname "$0")/.."

# Social card. QuickLook always thumbnails to a square, so the source is a
# 1200x1200 canvas with the artwork centred in the middle 630px band, then
# cropped back to 1200x630.
rm -f /tmp/og-image.src.svg.png
qlmanage -t -s 1200 -o /tmp design/og-image.src.svg >/dev/null
sips -c 630 1200 /tmp/og-image.src.svg.png --out public/og-image.png >/dev/null

# Home-screen icon. Authored at 1024 so QuickLook renders it 1:1 (it only fills
# the canvas when the intrinsic size equals -s), then downscaled to 180.
rm -f /tmp/apple-touch-icon.src.svg.png
qlmanage -t -s 1024 -o /tmp design/apple-touch-icon.src.svg >/dev/null
sips -z 180 180 /tmp/apple-touch-icon.src.svg.png --out public/apple-touch-icon.png >/dev/null

echo "wrote public/og-image.png ($(sips -g pixelWidth -g pixelHeight public/og-image.png | tail -2 | tr -d ' \n'))"
echo "wrote public/apple-touch-icon.png ($(sips -g pixelWidth -g pixelHeight public/apple-touch-icon.png | tail -2 | tr -d ' \n'))"
