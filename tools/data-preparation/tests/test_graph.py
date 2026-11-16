import json
from pathlib import Path

import pytest

from graph import attach_places, build_graph, is_walkable, read_ways, split_by_cells
from prepare import run
FIXTURES = Path(__file__).parent / "fixtures"
CATALOG = FIXTURES / "place-types.json"


def cell_of_e5(lat5, lon5):
    return lat5 // 1800, lon5 // 2500


@pytest.mark.parametrize(
    "tags,walkable",
    [
        ({"highway": "residential"}, True),
        ({"highway": "track"}, True),
        ({"highway": "primary"}, True),
        ({"highway": "motorway"}, False),
        ({"highway": "trunk"}, False),
        ({"highway": "footway", "foot": "no"}, False),
        ({"highway": "service", "access": "private"}, False),
        ({"building": "yes"}, False),
    ],
)
def test_walkable_ways(tags, walkable):
    assert is_walkable(tags) is walkable


def test_read_ways_keeps_walkable_ways_and_ignores_one_way():
    ids = [way_id for way_id, _ in read_ways(FIXTURES / "graph-mini.osm")]
    assert ids == [1, 5]


def test_straight_street_is_one_edge_with_its_shape():
    way = (1, [(10, 4345000, 554050), (11, 4345050, 554050), (12, 4345100, 554050)])
    nodes, edges = build_graph([way])
    assert set(nodes) == {10, 12}
    assert edges == [(10, 12, 111, [[4345050, 554050]])]


def test_length_is_rounded_once():
    # Two segments of 55.6 m: 111 m in total, not 56 + 56.
    way = (1, [(10, 4345000, 554050), (11, 4345050, 554050), (12, 4345100, 554050)])
    assert build_graph([way])[1][0][2] == 111


def test_shared_node_splits_both_streets():
    ways = [
        (1, [(1, 4345000, 554000), (2, 4345000, 554100), (3, 4345000, 554200)]),
        (2, [(4, 4345100, 554100), (2, 4345000, 554100), (5, 4344900, 554100)]),
    ]
    nodes, edges = build_graph(ways)
    assert set(nodes) == {1, 2, 3, 4, 5}
    assert len(edges) == 4


def test_edge_between_two_cells_is_written_in_both():
    way = (1, [(1, 4345000, 554900), (2, 4345000, 555100)])
    nodes, edges = build_graph([way])
    cells = split_by_cells(nodes, edges, {}, {}, cell_of_e5)
    assert set(cells) == {(2413, 221), (2413, 222)}
    assert cells[(2413, 221)]["edges"] == cells[(2413, 222)]["edges"]
    assert [n[0] for n in cells[(2413, 221)]["nodes"]] == [1]
    assert [n[0] for n in cells[(2413, 222)]["nodes"]] == [2]


def street():
    return build_graph([(1, [(10, 4345000, 554050), (11, 4345100, 554050)])])


def test_place_attaches_to_the_nearest_segment():
    nodes, edges = street()
    place = {"osmId": "n1", "lat": 43.4505, "lon": 5.5406}
    # 0.0001 degree of longitude is about 8 m; the foot of the perpendicular is mid-street.
    assert attach_places([place], nodes, edges) == {"n1": [10, 11, 8, 56, 111]}


def test_place_far_from_every_street_is_not_attached():
    nodes, edges = street()
    place = {"osmId": "n1", "lat": 43.4505, "lon": 5.5445}
    assert attach_places([place], nodes, edges) == {}


def test_attachment_is_written_in_the_cell_of_the_place():
    nodes, edges = street()
    access = {"n1": [10, 11, 8, 56, 111]}
    cells = split_by_cells(nodes, edges, access, {"n1": (2413, 221)}, cell_of_e5)
    assert cells[(2413, 221)]["access"] == access


def run_graph(tmp_path, name):
    removed = tmp_path / "removed.json"
    removed.write_text("[]")
    out = tmp_path / name
    run(FIXTURES / "graph-mini.osm", CATALOG, removed, out)
    return out


def test_run_writes_graph_files_and_report(tmp_path):
    out = run_graph(tmp_path, "out")
    files = sorted(p.name for p in (out / "graph").iterdir())
    assert files == ["2413_221.json", "2413_222.json"]
    case = json.loads((out / "graph" / "2413_221.json").read_text())
    assert case["access"] == {"n1001": [10, 12, 8, 56, 111]}
    report = json.loads((out / "report.json").read_text())["graph"]
    assert report["nodes"] == 4 and report["edges"] == 2 and report["cells"] == 2
    assert report["unattachedPlaces"] == 1
    assert report["largestCellBytes"] > 0


def test_graph_output_is_deterministic(tmp_path):
    first, second = run_graph(tmp_path, "a"), run_graph(tmp_path, "b")
    for path in (first / "graph").iterdir():
        assert path.read_bytes() == (second / "graph" / path.name).read_bytes()
