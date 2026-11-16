#!/usr/bin/env bash
# Extract a regional PMTiles file from a Protomaps build (see README.md).
set -euo pipefail

BUILD="${1:?usage: extract.sh YYYYMMDD [min_lon,min_lat,max_lon,max_lat] [maxzoom]}"
# Default: Provence-Alpes-Côte d'Azur, slightly padded.
BBOX="${2:-4.2,42.9,7.8,45.2}"
MAXZOOM="${3:-15}"
PMTILES="${PMTILES:-pmtiles}"
OUT="$(dirname "$0")/out"

mkdir -p "$OUT"
"$PMTILES" extract "https://build.protomaps.com/${BUILD}.pmtiles" "$OUT/zone.pmtiles" \
  --bbox="$BBOX" --maxzoom="$MAXZOOM"
ls -l "$OUT/zone.pmtiles"
