import json
import subprocess
import sys
from pathlib import Path

import osmium

from prepare import run

FIXTURES = Path(__file__).parent / "fixtures"
CATALOG = FIXTURES / "place-types.json"


def make_pbf(tmp_path):
    # The XML fixture has no replication date; a pbf can carry one in its header.
    path = tmp_path / "mini.osm.pbf"
    header = osmium.io.Header()
    header.set("osmosis_replication_timestamp", "2026-11-01T00:00:00Z")
    writer = osmium.SimpleWriter(str(path), 1000, header)
    for obj in osmium.FileProcessor(str(FIXTURES / "fuveau-mini.osm")):
        if obj.is_node():
            writer.add_node(obj)
        elif obj.is_way():
            writer.add_way(obj)
        else:
            writer.add_relation(obj)
    writer.close()
    return path


def do_run(src, out, removed):
    removed_file = out.parent / "removed.json"
    removed_file.write_text(json.dumps(removed))
    run(src, CATALOG, removed_file, out)


def test_manifest_describes_source_licence_and_grid(tmp_path):
    out = tmp_path / "out"
    do_run(make_pbf(tmp_path), out, [])
    manifest = json.loads((out / "manifest.json").read_text())
    assert manifest["source"] == "mini.osm.pbf"
    assert manifest["extractDate"] == "2026-11-01T00:00:00Z"
    assert "ODbL" in manifest["license"] and "OpenStreetMap" in manifest["license"]
    assert manifest["grid"] == {"latStepE5": 1800, "lonStepE5": 2500}


def test_report_counts_roles_per_commune(tmp_path):
    out = tmp_path / "out"
    do_run(FIXTURES / "fuveau-mini.osm", out, ["n999999"])
    report = json.loads((out / "report.json").read_text())
    (fuveau,) = report["communes"]
    assert fuveau["insee"] == "13039"
    # Inside Fuveau: 4 scene bakeries/cafes... counted by role, school is excluded.
    assert fuveau["excluded"] == 1
    assert fuveau["scene"] >= 5
    assert fuveau["alibi"] == 0
    assert report["outsideCommune"]["scene"] == 1  # Boulangerie Lointaine
    assert report["unknownRemovedIds"] == ["n999999"]


def test_cell_files_hold_each_place_once(tmp_path):
    out = tmp_path / "out"
    do_run(FIXTURES / "fuveau-mini.osm", out, ["n1007"])
    files = sorted((out / "places").glob("*.json"))
    assert files  # one file per non-empty cell, named {row}_{col}.json
    ids = [p["osmId"] for f in files for p in json.loads(f.read_text())]
    assert len(ids) == len(set(ids))
    removed = [p for f in files for p in json.loads(f.read_text()) if p.get("removed")]
    assert [p["osmId"] for p in removed] == ["n1007"]


def test_two_runs_are_identical_to_the_byte(tmp_path):
    pbf = make_pbf(tmp_path)
    for name in ("a", "b"):
        do_run(pbf, tmp_path / name, ["n1007"])
    names = sorted(p.relative_to(tmp_path / "a") for p in (tmp_path / "a").rglob("*") if p.is_file())
    assert names
    for rel in names:
        assert (tmp_path / "a" / rel).read_bytes() == (tmp_path / "b" / rel).read_bytes()
