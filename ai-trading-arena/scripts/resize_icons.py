#!/usr/bin/env python3
"""
Vivy Icon Resizer & Optimizer
Resizes generated images to web-optimized sizes and organizes them.
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Installing Pillow...")
    os.system("pip install Pillow")
    from PIL import Image


# Configuration: Map source filenames to output names and sizes
ICON_CONFIG = {
    # Logo
    "Vivy Logo Icon.png": {
        "output": "logo-icon",
        "sizes": [32, 64, 128, 256, 512],
        "category": "logo"
    },
    "Vivy Logo Wordmark.png": {
        "output": "logo-wordmark",
        "sizes": [200, 400],  # Width-based for wordmark
        "category": "logo",
        "keep_aspect": True
    },

    # Rank Badges
    "Gold Rank Badge.png": {
        "output": "rank-gold",
        "sizes": [24, 32, 48, 64],
        "category": "badges"
    },
    "Silver Rank Badge.png": {
        "output": "rank-silver",
        "sizes": [24, 32, 48, 64],
        "category": "badges"
    },
    "Bronze Rank Badge.png": {
        "output": "rank-bronze",
        "sizes": [24, 32, 48, 64],
        "category": "badges"
    },

    # Feature Icons (Landing Page)
    "Natural Language Icon.png": {
        "output": "feature-natural-language",
        "sizes": [48, 64, 96],
        "category": "features"
    },
    "Paper Upload Icon.png": {
        "output": "feature-paper-upload",
        "sizes": [48, 64, 96],
        "category": "features"
    },
    "Analytics Chart Icon.png": {
        "output": "feature-analytics",
        "sizes": [48, 64, 96],
        "category": "features"
    },
    "BrainAI Reasoning Icon.png": {
        "output": "feature-ai-reasoning",
        "sizes": [48, 64, 96],
        "category": "features"
    },
    "Transparent Pricing Icon.png": {
        "output": "feature-pricing",
        "sizes": [48, 64, 96],
        "category": "features"
    },
    "CommunityCrowd Icon.png": {
        "output": "feature-community",
        "sizes": [48, 64, 96],
        "category": "features"
    },

    # Trading Actions
    "BUY Action Icon.png": {
        "output": "action-buy",
        "sizes": [20, 24, 32, 48],
        "category": "actions"
    },
    "SELL Action Icon.png": {
        "output": "action-sell",
        "sizes": [20, 24, 32, 48],
        "category": "actions"
    },
    "Minimalist horizontal double": {
        "output": "action-hold",
        "sizes": [20, 24, 32, 48],
        "category": "actions",
        "partial_match": True
    },

    # Investor Section Icons
    "Crowdsourced Alpha Icon.png": {
        "output": "investor-alpha",
        "sizes": [32, 48, 64],
        "category": "investor"
    },
    "No Black Box Icon.png": {
        "output": "investor-transparent",
        "sizes": [32, 48, 64],
        "category": "investor"
    },
    "Viral Growth Icon.png": {
        "output": "investor-growth",
        "sizes": [32, 48, 64],
        "category": "investor"
    },
    "Monetization Icon.png": {
        "output": "investor-monetization",
        "sizes": [32, 48, 64],
        "category": "investor"
    },

    # Status Indicators
    "ActiveLive Status.png": {
        "output": "status-active",
        "sizes": [16, 24, 32],
        "category": "status"
    },
    "AnalyzingLoading Status.png": {
        "output": "status-loading",
        "sizes": [16, 24, 32],
        "category": "status"
    },

    # Hero Background
    "Hero Background Abstract.png": {
        "output": "hero-bg",
        "sizes": [1920, 1280, 640],  # Width-based
        "category": "backgrounds",
        "keep_aspect": True
    },
}


def find_matching_file(source_dir: Path, name: str, partial_match: bool = False) -> Path | None:
    """Find a file in source directory, with optional partial matching."""
    for file in source_dir.iterdir():
        if file.is_file():
            if partial_match and name.lower() in file.name.lower():
                return file
            elif file.name == name:
                return file
    return None


def resize_image(img: Image.Image, size: int, keep_aspect: bool = False) -> Image.Image:
    """Resize image to target size."""
    if keep_aspect:
        # Resize by width, maintain aspect ratio
        ratio = size / img.width
        new_height = int(img.height * ratio)
        return img.resize((size, new_height), Image.Resampling.LANCZOS)
    else:
        # Square resize
        return img.resize((size, size), Image.Resampling.LANCZOS)


def process_images(source_dir: str, output_dir: str = None):
    """Process all images according to configuration."""
    source_path = Path(source_dir)

    if not source_path.exists():
        print(f"Error: Source directory '{source_dir}' does not exist!")
        sys.exit(1)

    # Default output to public/icons in the project
    if output_dir is None:
        output_path = source_path.parent / "public" / "icons"
    else:
        output_path = Path(output_dir)

    # Create output directories
    categories = set(config["category"] for config in ICON_CONFIG.values())
    for category in categories:
        (output_path / category).mkdir(parents=True, exist_ok=True)

    print(f"\n🎨 Vivy Icon Resizer")
    print(f"{'='*50}")
    print(f"Source: {source_path}")
    print(f"Output: {output_path}")
    print(f"{'='*50}\n")

    processed = 0
    failed = 0

    for source_name, config in ICON_CONFIG.items():
        partial_match = config.get("partial_match", False)
        source_file = find_matching_file(source_path, source_name, partial_match)

        if not source_file:
            print(f"⚠️  Not found: {source_name}")
            failed += 1
            continue

        try:
            img = Image.open(source_file)

            # Convert to RGBA if needed (for PNG transparency)
            if img.mode != "RGBA":
                img = img.convert("RGBA")

            output_name = config["output"]
            category = config["category"]
            keep_aspect = config.get("keep_aspect", False)

            print(f"✅ Processing: {source_file.name}")

            for size in config["sizes"]:
                resized = resize_image(img, size, keep_aspect)

                # Generate output filename
                if keep_aspect:
                    out_filename = f"{output_name}-{size}w.png"
                else:
                    out_filename = f"{output_name}-{size}.png"

                out_path = output_path / category / out_filename

                # Save with optimization
                resized.save(out_path, "PNG", optimize=True)
                print(f"   → {category}/{out_filename} ({resized.width}x{resized.height})")

            processed += 1

        except Exception as e:
            print(f"❌ Error processing {source_name}: {e}")
            failed += 1

    print(f"\n{'='*50}")
    print(f"✅ Processed: {processed} images")
    print(f"⚠️  Failed: {failed} images")
    print(f"📁 Output: {output_path}")
    print(f"{'='*50}\n")

    # Generate a quick reference
    print("📋 Quick Reference for Next.js:")
    print("-" * 40)
    print('import Image from "next/image";')
    print("")
    print("// Example usage:")
    print('<Image src="/icons/logo/logo-icon-64.png" width={64} height={64} alt="Vivy" />')
    print('<Image src="/icons/badges/rank-gold-32.png" width={32} height={32} alt="Gold" />')
    print('<Image src="/icons/features/feature-analytics-48.png" width={48} height={48} alt="Analytics" />')


def main():
    if len(sys.argv) < 2:
        # Default to gen_img in current project
        script_dir = Path(__file__).parent.parent
        source_dir = script_dir / "gen_img"

        if not source_dir.exists():
            print("Usage: python resize_icons.py <source_folder> [output_folder]")
            print("\nExample:")
            print("  python resize_icons.py ./gen_img ./public/icons")
            sys.exit(1)
    else:
        source_dir = sys.argv[1]

    output_dir = sys.argv[2] if len(sys.argv) > 2 else None

    process_images(str(source_dir), output_dir)


if __name__ == "__main__":
    main()
