import base64
import re
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / "src/assets/community/live/hero-community-water.svg"
out = ROOT / "public/social-preview.png"
out.parent.mkdir(parents=True, exist_ok=True)

W, H = 1200, 630
GREEN = (7, 59, 43, 230)
CREAM = (241, 250, 233, 255)
ORANGE = (255, 138, 61, 255)
MUTED = (205, 236, 167, 255)

# Decode the embedded raster inside the exact hero SVG used by the homepage,
# then crop it to the standard Open Graph ratio without introducing a
# different photograph.
svg = source.read_text()
matches = re.findall(r"data:image/(?:png|jpeg);base64,([^\"]+)", svg)
if not matches:
    raise RuntimeError("Hero SVG does not contain an embedded raster image")
hero = Image.open(BytesIO(base64.b64decode(max(matches, key=len)))).convert("RGBA")
hero_ratio = max(W / hero.width, H / hero.height)
hero = hero.resize((int(hero.width * hero_ratio), int(hero.height * hero_ratio)), Image.Resampling.LANCZOS)
left = (hero.width - W) // 2
upper = (hero.height - H) // 2
canvas = hero.crop((left, upper, left + W, upper + H))

# Keep the left side text-safe, matching the homepage hero treatment.
overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
od = ImageDraw.Draw(overlay)
od.rectangle((0, 0, 735, H), fill=GREEN)
for x in range(735, 500, -1):
    alpha = int(165 * (735 - x) / 235)
    od.line((x, 0, x, H), fill=(7, 59, 43, alpha))
canvas = Image.alpha_composite(canvas, overlay)
draw = ImageDraw.Draw(canvas)

font_dir = Path("/usr/share/fonts/truetype/dejavu")
small = ImageFont.truetype(font_dir / "DejaVuSans-Bold.ttf", 16)
headline = ImageFont.truetype(font_dir / "DejaVuSans-Bold.ttf", 58)
body = ImageFont.truetype(font_dir / "DejaVuSans.ttf", 21)

# Compact hero metadata and mark.
draw.ellipse((58, 54, 104, 100), outline=MUTED, width=3)
draw.ellipse((72, 68, 90, 86), outline=MUTED, width=2)
draw.text((122, 60), "ELLE'S FOUNDATION · EST. 2015", font=small, fill=MUTED)
draw.text((60, 144), "FEEDING HOPE.", font=headline, fill=CREAM)
draw.text((60, 213), "RESTORING LIVES.", font=headline, fill=ORANGE)
draw.text((62, 322), "Every child deserves a chance,", font=body, fill=CREAM)
draw.text((62, 355), "every community deserves hope.", font=body, fill=CREAM)
draw.rounded_rectangle((62, 430, 275, 485), radius=27, fill=ORANGE)
draw.text((88, 447), "SUPPORT US  →", font=small, fill=(7, 59, 43, 255))
draw.text((62, 565), "elles-foundation.vercel.app", font=small, fill=CREAM)

canvas.convert("RGB").save(out, format="PNG", optimize=True)
print(out)
print(canvas.size)
