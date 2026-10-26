#!/bin/sh
# Renders the PNG app icons from the SVG sources here (needs rsvg-convert:
# brew install librsvg). Run from the repo root.
set -e
D=scripts/icons
rsvg-convert -w 192 -h 192 "$D/icon.svg" -o public/icon-192.png
rsvg-convert -w 512 -h 512 "$D/icon.svg" -o public/icon-512.png
rsvg-convert -w 512 -h 512 "$D/icon-maskable.svg" -o public/icon-maskable-512.png
# iOS home-screen icon: full-bleed, iOS rounds the corners itself.
rsvg-convert -w 180 -h 180 "$D/icon-maskable.svg" -o src/app/apple-icon.png
