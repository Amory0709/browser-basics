#!/usr/bin/env python3
"""Fix polygon ring winding so D3 geoBounds/fitExtent work (RFC 7946 CCW exteriors)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def ring_area(ring: list[list[float]]) -> float:
    """Signed area in degree space (sufficient for small regions)."""
    a = 0.0
    for i, (x0, y0) in enumerate(ring):
        x1, y1 = ring[(i + 1) % len(ring)]
        a += x0 * y1 - x1 * y0
    return a / 2.0


def fix_ring(ring: list[list[float]], exterior: bool) -> list[list[float]]:
    a = ring_area(ring)
    ccw = a > 0
    if exterior and not ccw:
        return list(reversed(ring))
    if not exterior and ccw:
        return list(reversed(ring))
    return ring


def fix_geometry(geom: dict) -> dict:
    t = geom["type"]
    if t == "Polygon":
        coords = geom["coordinates"]
        return {
            **geom,
            "coordinates": [fix_ring(r, i == 0) for i, r in enumerate(coords)],
        }
    if t == "MultiPolygon":
        return {
            **geom,
            "coordinates": [
                [fix_ring(r, i == 0) for i, r in enumerate(poly)] for poly in geom["coordinates"]
            ],
        }
    return geom


def main() -> None:
    for name in ("communes-ch.geojson", "communes-fr.geojson", "lac-leman.geojson"):
        path = ROOT / name
        fc = json.loads(path.read_text(encoding="utf-8"))
        for feat in fc.get("features", []):
            feat["geometry"] = fix_geometry(feat["geometry"])
        path.write_text(json.dumps(fc, separators=(",", ":")), encoding="utf-8")
        print(f"Fixed {path.name}")

    parts = []
    for name in ("communes-ch.geojson", "communes-fr.geojson", "lac-leman.geojson"):
        fc = json.loads((ROOT / name).read_text(encoding="utf-8"))
        key = name.split("-")[0].replace("communes", "ch" if "ch" in name else "fr")
        if "lac" in name:
            key = "lake"
        parts.append(f'"{key}":{json.dumps(fc, separators=(",", ":"))}')
    bundle = ROOT / "bundle.js"
    bundle.write_text(f"window.CERN_GEO = {{{','.join(parts)}}};\n", encoding="utf-8")
    print(f"Wrote {bundle}")


if __name__ == "__main__":
    main()
