from prepare import match_type, read_extract


def test_complete_tag_group_matches(types):
    tags = {"tourism": "artwork", "artwork_type": "statue"}
    assert match_type(tags, types) == "statue"


def test_incomplete_tag_group_does_not_match(types):
    assert match_type({"tourism": "artwork", "artwork_type": "sculpture"}, types) is None


def test_first_catalog_type_wins(types):
    assert match_type({"shop": "bakery", "amenity": "cafe"}, types) == "bakery"


def test_no_tags_hardcoded(types):
    # A type added to the catalog is recognised without touching the script.
    extra = types + [{"id": "chess_club", "role": "scene", "osmTags": [["club=chess"]]}]
    assert match_type({"club": "chess"}, types) is None
    assert match_type({"club": "chess"}, extra) == "chess_club"


def test_nameless_and_unknown_objects_are_dropped(types, extract_path):
    places = read_extract(extract_path, types).places
    names = {p["name"] for p in places}
    assert "Sculpture sans type" not in names  # no matching type
    assert all(p["name"] for p in places)  # the bench has no name
    assert not any(p["type"] == "bench" for p in places)


def test_excluded_named_place_is_kept_with_its_type(types, extract_path):
    places = {p["name"]: p for p in read_extract(extract_path, types).places}
    assert places["École des Pins"]["type"] == "school"


def test_no_address_in_output(types, extract_path):
    for place in read_extract(extract_path, types).places:
        assert not any(key.startswith("addr") for key in place)
        assert "street" not in place
