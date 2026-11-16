from prepare import cell_of, group_by_cell


def test_cell_from_rounded_coordinates():
    assert cell_of(43.4531, 5.5612) == (2414, 222)


def test_limit_belongs_to_exactly_one_cell():
    # lat 43.452 and lon 5.55 sit exactly on a cell limit.
    assert cell_of(43.452, 5.55) == (2414, 222)
    assert cell_of(43.45199, 5.55) == (2413, 222)


def test_negative_coordinates_use_floor():
    assert cell_of(-0.00001, -0.00001) == (-1, -1)


def test_places_are_grouped_once_and_empty_cells_have_no_entry():
    places = [
        {"osmId": "n2", "lat": 43.4531, "lon": 5.5612},
        {"osmId": "n1", "lat": 43.452, "lon": 5.55},
        {"osmId": "n3", "lat": 43.50, "lon": 5.70},
    ]
    cells = group_by_cell(places)
    assert sorted(cells) == [(2414, 222), (2416, 228)]
    assert [p["osmId"] for p in cells[(2414, 222)]] == ["n1", "n2"]  # sorted by id
    assert sum(len(v) for v in cells.values()) == 3
