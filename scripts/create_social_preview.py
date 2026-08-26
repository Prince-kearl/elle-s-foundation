from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / "src/assets/community/live/community-team.jpeg"
out = ROOT / "public/social-preview.png"
out.parent.mkdir(parents=True, exist_ok=True)

W, H = 1200, 630
GREEN = "#073B2B"
GREEN_2 = "#0F6848"
CREAM = "#F1FAE9"
ORANGE = "#FF8A3D"
MUTED = "#CDECA7"

canvas = Image.new("RGB", (W, H), GREEN)
draw = ImageDraw.Draw(canvas)

# Right-hand community photo with a subtle green brand treatment.
photo = Image.open(source).convert("RGB")
photo_ratio = H / photo.height
photo = photo.resize((int(photo.width * photo_ratio), H), Image.Resampling.LANCZOS)
left = max(0, (photo.width - int(W * 0.52)) // 2)
photo = photo.crop((left, 0, left + int(W * 0.52), H))
overlay = Image.new("RGBA", photo.size, (7, 59, 43, 0))
for x in range(photo.width):
    alpha = int(180 * (1 - x / photo.width) ** 1.6)
    ImageDraw.Draw(overlay).line((x, 0, x, H), fill=(7, 59, 43, alpha))
photo = Image.alpha_composite(photo.convert("RGBA"), overlay).convert("RGB")
canvas.paste(photo, (W - photo.width, 0))

# Soft divider glow.
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse((690, -90, 930, H + 90), fill=(15, 104, 72, 95))
glow = glow.filter(ImageFilter.GaussianBlur(36))
canvas = Image.alpha_composite(canvas.convert("RGBA"), glow)
draw = ImageDraw.Draw(canvas)

font_dir = Path("/usr/share/fonts/truetype/dejavu")
regular = ImageFont.truetype(font_dir / "DejaVuSans.ttf", 26)
small = ImageFont.truetype(font_dir / "DejaVuSans-Bold.ttf", 17)
headline = ImageFont.truetype(font_dir / "DejaVuSans-Bold.ttf", 61)
subhead = ImageFont.truetype(font_dir / "DejaVuSans.ttf", 25)

# Brand mark and eyebrow.
draw.ellipse((64, 60, 112, 108), outline=MUTED, width=3)
draw.ellipse((78, 74, 98, 94), outline=MUTED, width=2)
draw.text((130, 66), "ELLE'S FOUNDATION", font=small, fill=CREAM)
draw.text((66, 145), "FEEDING HOPE.", font=small, fill=ORANGE)

draw.text((64, 190), "Restoring", font=headline, fill=CREAM)
draw.text((64, 262), "Lives.", font=headline, fill=ORANGE)

# Supporting copy and CTA-style marker.
draw.text((67, 370), "Building stronger communities", font=subhead, fill=CREAM)
draw.text((67, 407), "with dignity, care, and hope.", font=subhead, fill=CREAM)
draw.rounded_rectangle((67, 492, 296, 548), radius=28, fill=ORANGE)
draw.text((94, 508), "SUPPORT US  →", font=small, fill=GREEN)

# Keep the right side visually quiet enough for link-preview cropping.
draw.text((830, 566), "elles-foundation.vercel.app", font=small, fill=CREAM)

canvas.convert("RGB").save(out, format="PNG", optimize=True)
print(out)
print(canvas.size)
