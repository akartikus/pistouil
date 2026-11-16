"""Turn an OSM extract into per-cell place files and a commune index (see README.md)."""

import argparse
import json
import math
import shutil
from collections import defaultdict, namedtuple
from pathlib import Path

import osmium
import shapely
from shapely import wkt
from shapely.geometry import MultiPolygon, Point, mapping
from shapely.strtree import STRtree

from graph import attach_places, build_graph, read_ways, split_by_cells

# Grid steps in 1e-5 degrees: about 2 km at 43.5 N.
LAT_STEP_E5 = 1800
LON_STEP_E5 = 2500
# About 50 m, in degrees.
SIMPLIFY_TOLERANCE = 0.0005
LICENSE = "Données © contributeurs OpenStreetMap, licence ODbL 1.0 (https://www.openstreetmap.org/copyright)"
ID_ORDER = {"n": 0, "w": 1, "r": 2}

Extract = namedtuple("Extract", "places communes geometries extract_date")


def build_matcher(types):
    """Return (type id, tag groups) in catalog order, and the set of tag keys they use."""
    groups = [(t["id"], [[tuple(tag.split("=", 1)) for tag in g] for g in t["osmTags"]]) for t in types]
    keys = {k for _, gs in groups for g in gs for k, _ in g}
    return groups, keys


def match_type(tags, types):
    groups, _ = build_matcher(types)
    return _match(tags, groups)


def _match(tags, groups):
    for type_id, type_groups in groups:
        if any(all(tags.get(k) == v for k, v in g) for g in type_groups):
            return type_id
    return None


def representative_point(geom):
    if geom.geom_type == "Point":
        return geom
    if geom.geom_type in ("Polygon", "MultiPolygon"):
        centroid = geom.centroid
        return centroid if centroid.within(geom) else geom.representative_point()
    return geom.representative_point()


def read_extract(path, types):
    groups, keys = build_matcher(types)
    processor = osmium.FileProcessor(str(path)).with_areas()
    wkt_factory = osmium.geom.WKTFactory()
    places, communes, geometries = [], [], {}
    for obj in processor:
        if not obj.tags:
            continue
        tags = {t.k: t.v for t in obj.tags}
        if obj.is_node():
            osm_id = f"n{obj.id}"
            geom = Point(obj.location.lon, obj.location.lat)
        elif obj.is_way():
            if obj.is_closed():  # its area is handled below
                continue
            osm_id = f"w{obj.id}"
            try:
                geom = wkt.loads(wkt_factory.create_linestring(obj))
            except osmium.InvalidLocationError:
                continue
        elif obj.is_area():
            osm_id = f"{'w' if obj.from_way() else 'r'}{obj.orig_id()}"
            geom = wkt.loads(wkt_factory.create_multipolygon(obj))
            if tags.get("boundary") == "administrative" and tags.get("admin_level") == "8" and "ref:INSEE" in tags:
                communes.append({"name": tags.get("name", ""), "insee": tags["ref:INSEE"], "geometry": geom})
        else:
            continue
        if not keys.intersection(tags):
            continue
        type_id = _match(tags, groups)
        if type_id is None or not tags.get("name"):
            continue
        point = representative_point(geom)
        place = {
            "osmId": osm_id,
            "name": tags["name"],
            "type": type_id,
            "lat": round(point.y, 5),
            "lon": round(point.x, 5),
        }
        if "opening_hours" in tags:
            place["openingHours"] = tags["opening_hours"]
        places.append(place)
        geometries[osm_id] = geom
    communes.sort(key=lambda c: c["insee"])
    return Extract(places, communes, geometries, processor.header.get("osmosis_replication_timestamp") or None)


def mark_removed(places, removed_ids):
    """Mark listed places as removed; return the listed ids that match no place."""
    wanted = set(removed_ids)
    found = set()
    for place in places:
        if place["osmId"] in wanted:
            place["removed"] = True
            found.add(place["osmId"])
    return sorted(wanted - found)


def cell_of_e5(lat5, lon5):
    return lat5 // LAT_STEP_E5, lon5 // LON_STEP_E5


def cell_of(lat, lon):
    # Integer arithmetic on rounded coordinates: no float error on cell limits.
    return cell_of_e5(round(lat * 100000), round(lon * 100000))


def id_key(place):
    return ID_ORDER[place["osmId"][0]], int(place["osmId"][1:])


def group_by_cell(places):
    cells = defaultdict(list)
    for place in sorted(places, key=id_key):
        cells[cell_of(place["lat"], place["lon"])].append(place)
    return dict(cells)


def _round_coords(value):
    if isinstance(value, (list, tuple)):
        return [_round_coords(v) for v in value]
    return round(value, 5)


def commune_entry(commune):
    geom = commune["geometry"]
    min_lon, min_lat, max_lon, max_lat = geom.bounds
    contour = shapely.set_precision(geom.simplify(SIMPLIFY_TOLERANCE, preserve_topology=True), 1e-5)
    if contour.geom_type == "Polygon":  # simplify drops a single-part MultiPolygon to a Polygon
        contour = MultiPolygon([contour])
    center = geom.centroid
    contour = mapping(contour)
    return {
        "name": commune["name"],
        "insee": commune["insee"],
        "center": {"lat": round(center.y, 5), "lon": round(center.x, 5)},
        # Rounded outwards so the box always contains the rounded contour.
        "bbox": {
            "minLat": _floor5(min_lat),
            "minLon": _floor5(min_lon),
            "maxLat": _ceil5(max_lat),
            "maxLon": _ceil5(max_lon),
        },
        "contour": {"type": contour["type"], "coordinates": _round_coords(contour["coordinates"])},
    }


def _floor5(x):
    # round() first: 43.47 * 100000 is 4347000.000000001 and would floor/ceil one step off.
    return math.floor(round(x * 100000, 3)) / 100000


def _ceil5(x):
    return -_floor5(-x)


def build_report(places, communes, types, unknown_removed):
    roles = {t["id"]: t["role"] for t in types}
    counts = {c["insee"]: {"scene": 0, "alibi": 0, "excluded": 0} for c in communes}
    outside = {"scene": 0, "alibi": 0, "excluded": 0}
    tree = STRtree([c["geometry"] for c in communes])
    for place in places:
        hits = tree.query(Point(place["lon"], place["lat"]), predicate="within")
        target = counts[communes[min(hits)]["insee"]] if len(hits) else outside
        target[roles[place["type"]]] += 1
    return {
        "communes": [{"insee": c["insee"], "name": c["name"], **counts[c["insee"]]} for c in communes],
        "outsideCommune": outside,
        "unknownRemovedIds": unknown_removed,
    }


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


def write_graph(extract_path, places, out_dir):
    """Write the per-cell pedestrian graph; return its figures for the report."""
    nodes, edges = build_graph(read_ways(extract_path))
    places = sorted(places, key=id_key)
    access = attach_places(places, nodes, edges)
    place_cells = {p["osmId"]: cell_of(p["lat"], p["lon"]) for p in places}
    cells = split_by_cells(nodes, edges, access, place_cells, cell_of_e5)
    shutil.rmtree(out_dir / "graph", ignore_errors=True)  # no stale cells from an older run
    largest = 0
    for (row, col), content in cells.items():
        path = out_dir / "graph" / f"{row}_{col}.json"
        write_json(path, content)
        largest = max(largest, path.stat().st_size)
    return {
        "cells": len(cells),
        "nodes": len(nodes),
        "edges": len(edges),
        "unattachedPlaces": len(places) - len(access),
        "largestCellBytes": largest,
    }


def run(input_path, catalog_path, removed_path, out_dir):
    input_path, out_dir = Path(input_path), Path(out_dir)
    types = json.loads(Path(catalog_path).read_text(encoding="utf-8"))
    removed = json.loads(Path(removed_path).read_text(encoding="utf-8"))
    extract = read_extract(input_path, types)
    unknown_removed = mark_removed(extract.places, removed)
    cells = group_by_cell(extract.places)
    shutil.rmtree(out_dir / "places", ignore_errors=True)  # no stale cells from an older run
    for (row, col), places in cells.items():
        write_json(out_dir / "places" / f"{row}_{col}.json", places)
    write_json(out_dir / "communes.json", [commune_entry(c) for c in extract.communes])
    write_json(
        out_dir / "manifest.json",
        {
            "source": input_path.name,
            "extractDate": extract.extract_date,
            "license": LICENSE,
            "grid": {"latStepE5": LAT_STEP_E5, "lonStepE5": LON_STEP_E5},
            "cells": len(cells),
            "places": len(extract.places),
        },
    )
    report = build_report(extract.places, extract.communes, types, unknown_removed)
    report["graph"] = write_graph(input_path, extract.places, out_dir)
    write_json(out_dir / "report.json", report)


def main():
    root = Path(__file__).resolve().parents[2]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, help="OSM extract (.osm.pbf)")
    parser.add_argument("--out", required=True, help="output directory")
    parser.add_argument("--catalog", default=root / "catalog" / "place-types.json")
    parser.add_argument("--removed", default=root / "catalog" / "removed-places.json")
    args = parser.parse_args()
    run(args.input, args.catalog, args.removed, args.out)


if __name__ == "__main__":
    main()
