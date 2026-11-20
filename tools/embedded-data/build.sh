#!/usr/bin/env bash
# Build the data shipped with the application for one commune (see README.md).
set -euo pipefail

PBF="${1:?usage: build.sh regional.osm.pbf YYYYMMDD [insee] [slug]}"
BUILD="${2:?usage: build.sh regional.osm.pbf YYYYMMDD [insee] [slug]}"
INSEE="${3:-13040}"
SLUG="${4:-fuveau}"
# The investigation radius (2 km) plus the 1 km the zone reads around it.
CELLS_MARGIN_M=3000
# The cut-out is wider than the cells kept, so that the streets at their edge are complete.
EXTRACT_MARGIN_M=4000
TILES_MARGIN_M=3300

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
PYTHON="${PYTHON:-$ROOT/tools/data-preparation/.venv/bin/python}"
INDEX="${INDEX:-$ROOT/tools/data-preparation/out/communes.json}"
PMTILES="${PMTILES:-pmtiles}"
OUT="$ROOT/static/data/$SLUG"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# Two lines: the rectangle to cut out of OSM, then the one of the tiles (lon/lat).
{ read -r EXTRACT_BBOX; read -r TILES_BBOX; } < <(
  "$PYTHON" "$HERE/zone.py" bounds "$INDEX" "$INSEE" "$WORK" "$EXTRACT_MARGIN_M" "$TILES_MARGIN_M")

osmium extract --bbox "$EXTRACT_BBOX" "$PBF" --output "$WORK/$SLUG.osm.pbf"
"$PYTHON" "$ROOT/tools/data-preparation/prepare.py" --input "$WORK/$SLUG.osm.pbf" --out "$WORK/out"
EXTRACT_DATE="$(osmium fileinfo --get header.option.osmosis_replication_timestamp "$PBF")"
"$PYTHON" "$HERE/zone.py" keep "$WORK" "$OUT" "$CELLS_MARGIN_M" "$(basename "$PBF")" "$EXTRACT_DATE"

"$PMTILES" extract "https://build.protomaps.com/${BUILD}.pmtiles" "$OUT/$SLUG.pmtiles" \
  --bbox="$TILES_BBOX" --maxzoom=15
du -sh "$OUT"
