#!/usr/bin/env python3
"""
Purpose: Split wbti/profiles.png (4×2) into profiles/profile{typeKey}.png.
Description:
- Order matches js/profileArt.js PROFILE_GRID_ORDER.
- Run from repo root: python3 scripts/split_profiles.py
- Requires Pillow (same as one-off crop workflow).
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "profiles.png"
OUT_DIR = ROOT / "profiles"

KEYS = ["+++", "++-", "+-+", "+--", "-++", "-+-", "--+", "---"]
COLS, ROWS = 4, 2


def span(total: int, parts: int, i: int) -> tuple[int, int]:
    start = i * total // parts
    end = (i + 1) * total // parts
    return start, end


def main() -> None:
    if not SRC.is_file():
        raise SystemExit(f"missing {SRC}")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    im = Image.open(SRC).convert("RGBA")
    w, h = im.size
    for i, key in enumerate(KEYS):
        col, row = i % COLS, i // COLS
        x0, x1 = span(w, COLS, col)
        y0, y1 = span(h, ROWS, row)
        tile = im.crop((x0, y0, x1, y1))
        dest = OUT_DIR / f"profile{key}.png"
        tile.save(dest, format="PNG", optimize=True)
        print(f"wrote {dest.relative_to(ROOT)} {tile.size}")


if __name__ == "__main__":
    main()
