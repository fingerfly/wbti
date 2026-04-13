#!/usr/bin/env python3
"""
Slices a profile sprite sheet into individual profile images.

This script takes a grid-based image (4x2) and splits it into individual 
PNG files based on a predefined set of personality type keys. 
The output is saved to the 'profiles/' directory relative to the 
project root.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Final

from PIL import Image

# Configuration constants
ROOT: Final = Path(__file__).resolve().parent.parent
SRC: Final = ROOT / "profiles.png"
OUT_DIR: Final = ROOT / "profiles"

# The order of keys must match the visual layout of profiles.png
KEYS: Final = ["+++", "++-", "+-+", "+--", "-++", "-+-", "--+", "---"]
COLS: Final = 4
ROWS: Final = 2

# Setup basic logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


def calculate_span(total: int, parts: int, index: int) -> tuple[int, int]:
    """
    Calculate the start and end pixel coordinates for a given segment.

    Args:
        total: The total width or height of the image.
        parts: The number of divisions (columns or rows).
        index: The current segment index.

    Returns:
        A tuple of (start_pixel, end_pixel).
    """
    start = index * total // parts
    end = (index + 1) * total // parts
    return start, end


def validate_grid_config(keys: list[str], cols: int, rows: int) -> None:
    """
    Ensure configured keys match the declared sprite-sheet grid dimensions.
    """
    expected = cols * rows
    actual = len(keys)
    if actual != expected:
        msg = (
            "Grid configuration mismatch: "
            f"KEYS has {actual} entries but COLS*ROWS is {expected}."
        )
        raise ValueError(msg)


def main() -> None:
    """
    Main execution logic to split the profile image into smaller tiles.
    """
    try:
        validate_grid_config(KEYS, COLS, ROWS)
    except ValueError as e:
        logger.error(str(e))
        raise SystemExit(1)

    if not SRC.is_file():
        logger.error(f"Source image not found at: {SRC}")
        raise SystemExit(1)

    try:
        OUT_DIR.mkdir(parents=True, exist_ok=True)
        
        # Convert to RGBA to ensure transparency is preserved during the crop/save
        with Image.open(SRC) as im:
            im = im.convert("RGBA")
            width, height = im.size

            for i, key in enumerate(KEYS):
                # Determine grid position
                col, row = i % COLS, i // COLS

                # Calculate coordinates for the crop box
                x0, x1 = calculate_span(width, COLS, col)
                y0, y1 = calculate_span(height, ROWS, row)

                # Extract the tile and save
                tile = im.crop((x0, y0, x1, y1))
                dest = OUT_DIR / f"profile{key}.png"
                
                tile.save(dest, format="PNG", optimize=True)
                logger.info(f"Wrote {dest.relative_to(ROOT)} - Size: {tile.size}")

    except Exception as e:
        logger.exception(f"An unexpected error occurred while processing images: {e}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
