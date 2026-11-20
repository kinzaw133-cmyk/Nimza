import os
from PIL import Image, ImageDraw, ImageFilter, ImageOps

src_path = r"C:\Users\786 Computers\.gemini\antigravity\brain\7f05869e-e11a-4363-b637-9d70201a50db\nimza_restaurant_logo_1795155972450.jpg"
public_dir = r"c:\Users\786 Computers\OneDrive\Desktop\web project\public"

os.makedirs(public_dir, exist_ok=True)
img = Image.open(src_path).convert("RGB")
w, h = img.size

# Palette matching website
IVORY = (250, 250, 248)    # #FAFAF8
CHARCOAL = (31, 36, 31)    # #1F241F
GOLD = (185, 154, 91)       # #B99A5B
GOLD_LIGHT = (216, 191, 131)# #D8BF83
GOLD_DARK = (142, 114, 59)  # #8E723B

# 1. Save original
img.save(os.path.join(public_dir, "logo-original.jpeg"), "JPEG", quality=95)

# 2. logo-footer.jpg (Clean, square, centered emblem 600x600 with complete tagline & heart)
# Content bbox is: x: 182-841 (center 511), y: 156-866 (center 511)
# Bounding box is ~660x710. Let's crop from x=130 to 892, y=120 to 882 with balanced padding
crop_box = (130, 120, 892, 882) # 762 x 762 square crop!
full_crop = img.crop(crop_box)

footer_canvas = Image.new("RGB", (600, 600), IVORY)
full_resized = full_crop.resize((560, 560), Image.Resampling.LANCZOS)
footer_canvas.paste(full_resized, (20, 20))
footer_canvas.save(os.path.join(public_dir, "logo-footer.jpg"), "JPEG", quality=95)
print("Saved logo-footer.jpg (600x600)")

# 3. logo-circle.jpg (Circular seal with gold border rings)
circle_size = 512
circle_canvas = Image.new("RGB", (circle_size, circle_size), IVORY)

# Circular mask
mask = Image.new("L", (circle_size, circle_size), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.ellipse((8, 8, circle_size - 8, circle_size - 8), fill=255)

# Center content resized to fit comfortably inside the circle
circle_content = full_crop.resize((circle_size - 32, circle_size - 32), Image.Resampling.LANCZOS)
circle_canvas.paste(circle_content, (16, 16))

# Dual gold border rings
draw = ImageDraw.Draw(circle_canvas)
draw.ellipse((8, 8, circle_size - 8, circle_size - 8), outline=GOLD, width=4)
draw.ellipse((14, 14, circle_size - 14, circle_size - 14), outline=GOLD_LIGHT, width=1)
circle_canvas.save(os.path.join(public_dir, "logo-circle.jpg"), "JPEG", quality=95)
print("Saved logo-circle.jpg (512x512)")

# 4. logo-header.jpg: Focused on the Steam Swirl, Cloche/Bowl, "Nimza" and "· RESTAURANT ·"
header_crop = img.crop((165, 145, 858, 705))
hw, hh = header_crop.size

header_canvas = Image.new("RGB", (400, 320), IVORY)
ratio = min(380 / hw, 300 / hh)
target_w = int(hw * ratio)
target_h = int(hh * ratio)
header_resized = header_crop.resize((target_w, target_h), Image.Resampling.LANCZOS)
header_canvas.paste(header_resized, ((400 - target_w) // 2, (320 - target_h) // 2))
header_canvas.save(os.path.join(public_dir, "logo-header.jpg"), "JPEG", quality=95)
print("Saved logo-header.jpg (400x320)")

# 5. logo.png (Transparent PNG)
rgba = full_crop.convert("RGBA")
pixels = rgba.load()
w_c, h_c = full_crop.size
bg_ref = (247, 248, 243)

for y in range(h_c):
    for x in range(w_c):
        r, g, b, a = pixels[x, y]
        dist = ((r - bg_ref[0])**2 + (g - bg_ref[1])**2 + (b - bg_ref[2])**2)**0.5
        if dist < 12:
            pixels[x, y] = (250, 250, 248, 0)
        elif dist < 32:
            alpha = int(255 * (dist - 12) / 20)
            pixels[x, y] = (r, g, b, alpha)

trans_resized = rgba.resize((600, 600), Image.Resampling.LANCZOS)
trans_resized.save(os.path.join(public_dir, "logo.png"), "PNG")
print("Saved logo.png (600x600)")

# 6. favicon.ico (64x64, 32x32, 16x16)
fav = circle_canvas.resize((64, 64), Image.Resampling.LANCZOS)
fav.save(os.path.join(public_dir, "favicon.ico"), format="ICO", sizes=[(64, 64), (32, 32), (16, 16)])
print("Saved favicon.ico")
