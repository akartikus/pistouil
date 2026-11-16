"""Pedestrian graph per grid cell, built from OSM ways (see README.md)."""

import math
from collections import defaultdict

import osmium
import shapely
from shapely.strtree import STRtree

WALKABLE = {
    "residential", "service", "pedestrian", "footway", "path", "steps", "track", "cycleway",
    "living_street", "unclassified", "tertiary", "secondary", "primary",
}
# A place farther than this from every street is not attached.
MAX_ACCESS_M = 300
EARTH_RADIUS_M = 6371000
M_PER_DEG = math.radians(1) * EARTH_RADIUS_M


def is_walkable(tags):
    return tags.get("highway") in WALKABLE and tags.get("foot") != "no" and tags.get("access") != "private"


def read_ways(path):
    """Walkable ways as (way id, [(node id, lat5, lon5), ...]); one-way tags are ignored."""
    ways = []
    for obj in osmium.FileProcessor(str(path)).with_locations():
        if not obj.is_way() or not is_walkable(obj.tags):
            continue
        try:
            points = [(n.ref, round(n.lat * 100000), round(n.lon * 100000)) for n in obj.nodes]
        except osmium.InvalidLocationError:
            continue
        if len(points) >= 2:
            ways.append((obj.id, points))
    return ways


def _distance_m(p, q):
    lat1, lat2 = math.radians(p[0] / 100000), math.radians(q[0] / 100000)
    dlon = math.radians((q[1] - p[1]) / 100000)
    h = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * EARTH_RADIUS_M * math.asin(math.sqrt(h))


def build_graph(ways):
    """Contract ways into nodes {id: (lat5, lon5)} and sorted edges (a, b, length m, shape)."""
    uses = defaultdict(int)
    for _, points in ways:
        for point in points:
            uses[point[0]] += 1
    nodes, edges = {}, []
    for _, points in ways:
        start = 0
        for i in range(1, len(points)):
            # Ends of a way and points shared with another way (or visited twice) are nodes.
            if uses[points[i][0]] > 1 or i == len(points) - 1:
                piece = points[start : i + 1]
                if piece[0][0] > piece[-1][0]:
                    piece = piece[::-1]
                coords = [(p[1], p[2]) for p in piece]
                length = round(sum(_distance_m(p, q) for p, q in zip(coords, coords[1:])))
                nodes[piece[0][0]], nodes[piece[-1][0]] = coords[0], coords[-1]
                edges.append((piece[0][0], piece[-1][0], length, [list(c) for c in coords[1:-1]]))
                start = i
    edges.sort(key=lambda e: (e[0], e[1], e[2], e[3]))
    return nodes, edges


def _project(points, lat, lon):
    """Closest point of a polyline to (lat, lon): (distance m, position along the line m)."""
    kx = math.cos(math.radians(lat)) * M_PER_DEG
    best, walked = (math.inf, 0.0), 0.0
    for (lat1, lon1), (lat2, lon2) in zip(points, points[1:]):
        x1, y1 = (lon1 / 100000 - lon) * kx, (lat1 / 100000 - lat) * M_PER_DEG
        x2, y2 = (lon2 / 100000 - lon) * kx, (lat2 / 100000 - lat) * M_PER_DEG
        dx, dy = x2 - x1, y2 - y1
        size = math.hypot(dx, dy)
        t = 0.0 if size == 0 else max(0.0, min(1.0, -(x1 * dx + y1 * dy) / (size * size)))
        distance = math.hypot(x1 + t * dx, y1 + t * dy)
        if distance < best[0]:
            best = (distance, walked + t * size)
        walked += size
    return best


def attach_places(places, nodes, edges):
    """Attach each place to its nearest edge: {osm id: [node a, node b, access m, position m, edge m]}."""
    lines = [[nodes[a], *map(tuple, shape), nodes[b]] for a, b, _, shape in edges]
    if not lines:
        return {}
    tree = STRtree([shapely.LineString([(lon / 100000, lat / 100000) for lat, lon in line]) for line in lines])
    reach = MAX_ACCESS_M / M_PER_DEG * 1.05
    attached = {}
    for place in places:
        lat, lon = place["lat"], place["lon"]
        reach_lon = reach / math.cos(math.radians(lat))
        window = shapely.box(lon - reach_lon, lat - reach, lon + reach_lon, lat + reach)
        best = None
        for index in sorted(tree.query(window)):
            distance, position = _project(lines[index], lat, lon)
            if best is None or distance < best[0]:
                best = (distance, position, index)
        if best is None or round(best[0]) > MAX_ACCESS_M:
            continue
        a, b, length, _ = edges[best[2]]
        attached[place["osmId"]] = [a, b, round(best[0]), min(round(best[1]), length), length]
    return attached


def split_by_cells(nodes, edges, access, place_cells, cell_of_e5):
    """Per-cell content: its nodes, the edges touching them and the attachments of its places."""
    cells = defaultdict(lambda: {"nodes": [], "edges": [], "access": {}})
    for node_id in sorted(nodes):
        cells[cell_of_e5(*nodes[node_id])]["nodes"].append([node_id, *nodes[node_id]])
    for a, b, length, shape in edges:
        for cell in {cell_of_e5(*nodes[a]), cell_of_e5(*nodes[b])}:
            cells[cell]["edges"].append([a, b, length, shape])
    for osm_id, entry in access.items():
        cells[place_cells[osm_id]]["access"][osm_id] = entry
    return dict(cells)
