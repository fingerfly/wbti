"""
Purpose: Validate split_profiles grid configuration safeguards.
"""

from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path
from unittest.mock import patch


MODULE_PATH = (
    Path(__file__).resolve().parent.parent / "scripts" / "split_profiles.py"
)
SPEC = importlib.util.spec_from_file_location("split_profiles", MODULE_PATH)
split_profiles = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(split_profiles)


class SplitProfilesConfigTests(unittest.TestCase):
    def test_validate_grid_config_raises_on_mismatch(self) -> None:
        with self.assertRaises(ValueError):
            split_profiles.validate_grid_config(
                keys=["+++", "++-", "+-+"],
                cols=2,
                rows=2,
            )

    def test_validate_grid_config_accepts_matching_counts(self) -> None:
        split_profiles.validate_grid_config(
            keys=["+++", "++-", "+-+", "+--"],
            cols=2,
            rows=2,
        )

    def test_main_exits_when_grid_config_is_invalid(self) -> None:
        with patch.object(split_profiles, "KEYS", ["+++", "++-"]):
            with self.assertRaises(SystemExit) as cm:
                split_profiles.main()
        self.assertEqual(cm.exception.code, 1)


if __name__ == "__main__":
    unittest.main()
