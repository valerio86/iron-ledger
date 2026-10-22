#!/bin/zsh
# Rebuild every icon from tools/icon-art.svg (needs Google Chrome for rendering).
#   rounded  : icons/icon.svg, icon-192.png, icon-512.png (transparent corners; browser tab, manifest "any")
#   fullbleed: listing-1024.png (Strava etc.), apple-touch-icon.png (iOS rounds corners itself)
#   maskable : icon-maskable-512.png (art shrunk into Android's safe zone)
set -e
cd "${0:A:h}/.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ART=$(sed '1d' tools/icon-art.svg)
BG="#F6C343"
svg() {  # $1 = clip (rounded|square), $2 = art scale
  local clip=""; [[ $1 == rounded ]] && clip=' clip-path="url(#r)"'
  print -r -- "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1024 1024\"><defs><clipPath id=\"r\"><rect width=\"1024\" height=\"1024\" rx=\"224\"/></clipPath></defs><g$clip><rect width=\"1024\" height=\"1024\" fill=\"$BG\"/><g transform=\"translate(512 512) scale($2) translate(-512 -512)\">$ART</g></g></svg>"
}
TMP=$(mktemp -d)
render() {  # $1 = svg file, $2 = size, $3 = out png
  print -r -- "<body style='margin:0'><img src='file://$1' width='$2' height='$2' style='display:block'></body>" > $TMP/w.html
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 --window-size=$2,$2 --screenshot=$3 file://$TMP/w.html >/dev/null 2>&1
}
svg rounded 1 > icons/icon.svg
svg square 1 > $TMP/full.svg
svg square 0.8 > $TMP/mask.svg
render $PWD/icons/icon.svg 192 icons/icon-192.png
render $PWD/icons/icon.svg 512 icons/icon-512.png
render $TMP/full.svg 1024 icons/listing-1024.png
render $TMP/full.svg 180 icons/apple-touch-icon.png
render $TMP/mask.svg 512 icons/icon-maskable-512.png
rm -rf $TMP
echo "icons rebuilt"
