from prepare import mark_removed, read_extract


def test_listed_places_are_marked_removed_and_kept(types, extract_path):
    places = read_extract(extract_path, types).places
    unknown = mark_removed(places, ["n1007"])
    by_id = {p["osmId"]: p for p in places}
    assert by_id["n1007"]["removed"] is True
    assert unknown == []
    assert all("removed" not in p for i, p in by_id.items() if i != "n1007")


def test_unknown_removed_id_is_reported_not_fatal(types, extract_path):
    places = read_extract(extract_path, types).places
    assert mark_removed(places, ["n999999"]) == ["n999999"]
