from shapely.geometry import shape

from prepare import read_extract, commune_entry


def entries(types, path):
    return [commune_entry(c) for c in read_extract(path, types).communes]


def test_commune_entry_has_name_insee_center_bbox_contour(types, extract_path):
    (fuveau,) = entries(types, extract_path)
    assert fuveau["name"] == "Fuveau"
    assert fuveau["insee"] == "13039"
    assert set(fuveau["center"]) == {"lat", "lon"}
    assert set(fuveau["bbox"]) == {"minLat", "minLon", "maxLat", "maxLon"}
    assert fuveau["contour"]["type"] == "MultiPolygon"


def test_center_and_contour_are_inside_bbox(types, extract_path):
    (f,) = entries(types, extract_path)
    box = f["bbox"]
    assert box["minLat"] <= f["center"]["lat"] <= box["maxLat"]
    assert box["minLon"] <= f["center"]["lon"] <= box["maxLon"]
    for polygon in f["contour"]["coordinates"]:
        for ring in polygon:
            for lon, lat in ring:
                assert box["minLon"] <= lon <= box["maxLon"]
                assert box["minLat"] <= lat <= box["maxLat"]


def test_contour_is_simpler_and_still_valid(types, extract_path):
    extract = read_extract(extract_path, types)
    (commune,) = extract.communes
    entry = commune_entry(commune)
    simplified = shape(entry["contour"])
    assert simplified.is_valid
    assert len(simplified.geoms[0].exterior.coords) < len(commune["geometry"].geoms[0].exterior.coords)
