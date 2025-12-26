#!/usr/bin/env python3
"""
Icon Resizer for Vivy
Resizes PNG icons to multiple sizes for different use cases.

Usage:
    python resize_icons.py

Requirements:
    pip install Pillow
"""

import os
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Please install Pillow: pip install Pillow")
    exit(1)

# Base directory for icons
ICONS_DIR = Path(__file__).parent.parent / "public" / "icons"

# Icon definitions: (source_folder, source_name, output_sizes)
# Output sizes are tuples of (size, suffix)
ICON_CONFIGS = [
    # Logo icons
    {
        "folder": "logo",
        "source": "vivy-logo.png",  # User provides this
        "sizes": [(24, "-24"), (32, "-32"), (48, "-48"), (64, "-64"), (128, "-128")],
        "output_base": "vivy-logo"
    },

    # Rank badges
    {
        "folder": "badges",
        "source": "rank-gold.png",
        "sizes": [(24, "-24"), (32, "-32"), (48, "-48")],
        "output_base": "rank-gold"
    },
    {
        "folder": "badges",
        "source": "rank-silver.png",
        "sizes": [(24, "-24"), (32, "-32"), (48, "-48")],
        "output_base": "rank-silver"
    },
    {
        "folder": "badges",
        "source": "rank-bronze.png",
        "sizes": [(24, "-24"), (32, "-32"), (48, "-48")],
        "output_base": "rank-bronze"
    },

    # Feature icons
    {
        "folder": "features",
        "source": "feature-nlp.png",
        "sizes": [(32, "-32"), (48, "-48"), (64, "-64")],
        "output_base": "feature-nlp"
    },
    {
        "folder": "features",
        "source": "feature-paper.png",
        "sizes": [(32, "-32"), (48, "-48"), (64, "-64")],
        "output_base": "feature-paper"
    },
    {
        "folder": "features",
        "source": "feature-analytics.png",
        "sizes": [(32, "-32"), (48, "-48"), (64, "-64")],
        "output_base": "feature-analytics"
    },
    {
        "folder": "features",
        "source": "feature-explain.png",
        "sizes": [(32, "-32"), (48, "-48"), (64, "-64")],
        "output_base": "feature-explain"
    },
    {
        "folder": "features",
        "source": "feature-pricing.png",
        "sizes": [(32, "-32"), (48, "-48"), (64, "-64")],
        "output_base": "feature-pricing"
    },
    {
        "folder": "features",
        "source": "feature-community.png",
        "sizes": [(32, "-32"), (48, "-48"), (64, "-64")],
        "output_base": "feature-community"
    },

    # Action icons
    {
        "folder": "actions",
        "source": "action-buy.png",
        "sizes": [(16, "-16"), (24, "-24"), (32, "-32")],
        "output_base": "action-buy"
    },
    {
        "folder": "actions",
        "source": "action-sell.png",
        "sizes": [(16, "-16"), (24, "-24"), (32, "-32")],
        "output_base": "action-sell"
    },
    {
        "folder": "actions",
        "source": "action-hold.png",
        "sizes": [(16, "-16"), (24, "-24"), (32, "-32")],
        "output_base": "action-hold"
    },

    # Investor icons
    {
        "folder": "investor",
        "source": "investor-alpha.png",
        "sizes": [(24, "-24"), (32, "-32"), (48, "-48")],
        "output_base": "investor-alpha"
    },
    {
        "folder": "investor",
        "source": "investor-brain.png",
        "sizes": [(24, "-24"), (32, "-32"), (48, "-48")],
        "output_base": "investor-brain"
    },
    {
        "folder": "investor",
        "source": "investor-rocket.png",
        "sizes": [(24, "-24"), (32, "-32"), (48, "-48")],
        "output_base": "investor-rocket"
    },
    {
        "folder": "investor",
        "source": "investor-money.png",
        "sizes": [(24, "-24"), (32, "-32"), (48, "-48")],
        "output_base": "investor-money"
    },

    # Status icons
    {
        "folder": "status",
        "source": "status-active.png",
        "sizes": [(16, "-16"), (24, "-24")],
        "output_base": "status-active"
    },
    {
        "folder": "status",
        "source": "status-live.png",
        "sizes": [(16, "-16"), (24, "-24")],
        "output_base": "status-live"
    },

    # Dashboard icons (NEW - for Quick Actions)
    {
        "folder": "dashboard",
        "source": "create-agent.png",
        "sizes": [(32, "-32"), (48, "-48"), (64, "-64")],
        "output_base": "create-agent"
    },
    {
        "folder": "dashboard",
        "source": "leaderboard.png",
        "sizes": [(32, "-32"), (48, "-48"), (64, "-64")],
        "output_base": "leaderboard"
    },
    {
        "folder": "dashboard",
        "source": "arena.png",
        "sizes": [(32, "-32"), (48, "-48"), (64, "-64")],
        "output_base": "arena"
    },
]


def resize_icon(source_path: Path, output_path: Path, size: int) -> bool:
    """Resize a single icon to the specified size."""
    try:
        with Image.open(source_path) as img:
            # Convert to RGBA if necessary
            if img.mode != "RGBA":
                img = img.convert("RGBA")

            # Use high-quality resampling
            resized = img.resize((size, size), Image.Resampling.LANCZOS)

            # Save with optimization
            resized.save(output_path, "PNG", optimize=True)
            return True
    except Exception as e:
        print(f"  Error resizing {source_path}: {e}")
        return False


def process_icons():
    """Process all icon configurations."""
    print("=" * 50)
    print("Vivy Icon Resizer")
    print("=" * 50)

    success_count = 0
    skip_count = 0
    error_count = 0

    for config in ICON_CONFIGS:
        folder = ICONS_DIR / config["folder"]
        source_path = folder / config["source"]

        # Create folder if it doesn't exist
        folder.mkdir(parents=True, exist_ok=True)

        print(f"\nProcessing: {config['folder']}/{config['source']}")

        if not source_path.exists():
            print(f"  [SKIP] Source file not found: {source_path}")
            skip_count += 1
            continue

        for size, suffix in config["sizes"]:
            output_name = f"{config['output_base']}{suffix}.png"
            output_path = folder / output_name

            if resize_icon(source_path, output_path, size):
                print(f"  [OK] Created: {output_name} ({size}x{size})")
                success_count += 1
            else:
                error_count += 1

    print("\n" + "=" * 50)
    print(f"Summary: {success_count} created, {skip_count} skipped, {error_count} errors")
    print("=" * 50)

    if skip_count > 0:
        print("\nTo process skipped icons, add source PNG files to:")
        print(f"  {ICONS_DIR}")
        print("\nExpected source files (place in respective folders):")
        for config in ICON_CONFIGS:
            source_path = ICONS_DIR / config["folder"] / config["source"]
            if not source_path.exists():
                print(f"  - {config['folder']}/{config['source']}")


if __name__ == "__main__":
    process_icons()
