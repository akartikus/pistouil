from shapely.geometry import Point

from prepare import read_extract


def by_name(types, path):
    return {p["name"]: p for p in read_extract(path, types).places}


def test_crescent_park_point_is_inside_the_park(types, extract_path):
    extract = read_extract(extract_path, types)
    park = extract.geometries["w2001"]
    assert not park.centroid.within(park)  # the fixture really is a crescent
    place = {p["osmId"]: p for p in extract.places}["w2001"]
    assert Point(place["lon"], place["lat"]).within(park.buffer(1e-5))


def test_line_gets_a_point_on_the_line(types, extract_path):
    extract = read_extract(extract_path, types)
    street = extract.geometries["w3001"]
    place = {p["osmId"]: p for p in extract.places}["w3001"]
    assert Point(place["lon"], place["lat"]).distance(street) < 1e-5


def test_one_object_gives_one_place(types, extract_path):
    ids = [p["osmId"] for p in read_extract(extract_path, types).places]
    assert len(ids) == len(set(ids))
    assert ids.count("w3001") == 1


def test_coordinates_have_at_most_five_decimals(types, extract_path):
    for place in read_extract(extract_path, types).places:
        assert place["lat"] == round(place["lat"], 5)
        assert place["lon"] == round(place["lon"], 5)


def test_opening_hours_kept_verbatim_or_absent(types, extract_path):
    places = by_name(types, extract_path)
    assert places["Boulangerie du Cours"]["openingHours"] == "Mo-Sa 07:00-19:30"
    assert "openingHours" not in places["Statue du Poète"]
