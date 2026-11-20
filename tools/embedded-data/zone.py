"""Geometry helpers for build.sh: the rectangles of a commune and the cells to keep."""

import json
import math
import shutil
import sys
from pathlib import Path

METRES_PER_DEGREE = 111195  # same constant as zoneBounds in src/lib/map/zone.ts


def widened(bbox, margin_m):
    d_lat = margin_m / METRES_PER_DEGREE
    d_lon = d_lat / math.cos(math.radians((bbox["minLat"] + bbox["maxLat"]) / 2))
    return {
        "minLat": bbox["minLat"] - d_lat,
        "minLon": bbox["minLon"] - d_lon,
        "maxLat": bbox["maxLat"] + d_lat,
        "maxLon": bbox["maxLon"] + d_lon,
    }


def cells_covering(grid, bbox):
    """Same integer arithmetic as cellsCovering in src/lib/map/zone.ts."""

    def cell(value, step):
        return math.floor(round(value * 100000) / step)

    return {
        f"{row}_{col}"
        for row in range(cell(bbox["minLat"], grid["latStepE5"]), cell(bbox["maxLat"], grid["latStepE5"]) + 1)
        for col in range(cell(bbox["minLon"], grid["lonStepE5"]), cell(bbox["maxLon"], grid["lonStepE5"]) + 1)
    }


def lon_lat(bbox):
    return f"{bbox['minLon']:.5f},{bbox['minLat']:.5f},{bbox['maxLon']:.5f},{bbox['maxLat']:.5f}"


def bounds(index, insee, work, extract_margin_m, tiles_margin_m):
    """Writes commune.json, prints the rectangle to cut out of OSM, then the one for the tiles."""
    commune = next(c for c in json.loads(Path(index).read_text("utf-8")) if c["insee"] == insee)
    Path(work, "commune.json").write_text(json.dumps(commune, ensure_ascii=False) + "\n", "utf-8")
    print(lon_lat(widened(commune["bbox"], extract_margin_m)))
    print(lon_lat(widened(commune["bbox"], tiles_margin_m)))


def keep(work, out, margin_m, source, extract_date):
    """Copies the cells the game can read (the commune widened by the margin) and a matching manifest.

    The manifest keeps the source and date of the regional extract, so that the data version is
    the one of the regional preparation (osmium extract drops the replication timestamp).
    """
    prepared = Path(work, "out")
    manifest = json.loads(Path(prepared, "manifest.json").read_text("utf-8"))
    commune = json.loads(Path(work, "commune.json").read_text("utf-8"))
    wanted = cells_covering(manifest["grid"], widened(commune["bbox"], margin_m))
    shutil.rmtree(out, ignore_errors=True)
    places = 0
    cells = 0
    for kind in ("places", "graph"):
        Path(out, kind).mkdir(parents=True)
        for cell in sorted(wanted):
            file = Path(prepared, kind, f"{cell}.json")
            if not file.exists():
                continue
            shutil.copyfile(file, Path(out, kind, file.name))
            if kind == "places":
                cells += 1
                places += len(json.loads(file.read_text("utf-8")))
    manifest.update(source=source, extractDate=extract_date or None, cells=cells, places=places)
    Path(out, "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False) + "\n", "utf-8")
    shutil.copyfile(Path(work, "commune.json"), Path(out, "commune.json"))


if __name__ == "__main__":
    command, *args = sys.argv[1:]
    if command == "bounds":
        index, insee, work, extract_margin_m, tiles_margin_m = args
        bounds(index, insee, work, float(extract_margin_m), float(tiles_margin_m))
    elif command == "keep":
        work, out, margin_m, source, extract_date = args
        keep(work, out, float(margin_m), source, extract_date)
