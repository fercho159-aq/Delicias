#!/usr/bin/env python3
"""Extract product images from the catalog PDF."""
import fitz  # PyMuPDF
import os
import sys

PDF_PATH = "/Users/fernandotrejo/Downloads/catalogo_botana.pdf"
OUTPUT_DIR = "/Users/fernandotrejo/Developer/Delicias/public/products"

# Skip pages: 0 = cover (page 01)
# Page 1 = Cacahuates + Chocolate (page 02)
# Page 2 = Dulces (page 03)
# Page 3 = Frutos Secos + Semillas (page 04)
# Page 4 = Nueces + Verduras Deshidratadas (page 05)
# Page 5 = Mixes (pages 06-07)

doc = fitz.open(PDF_PATH)

os.makedirs(OUTPUT_DIR, exist_ok=True)

for page_num in range(len(doc)):
    page = doc[page_num]
    images = page.get_images(full=True)
    print(f"\nPage {page_num + 1}: {len(images)} images found")

    for img_idx, img in enumerate(images):
        xref = img[0]
        base_image = doc.extract_image(xref)
        if base_image:
            ext = base_image["ext"]
            width = base_image["width"]
            height = base_image["height"]
            image_bytes = base_image["image"]

            # Skip very small images (logos, icons) and very large ones (backgrounds)
            if width < 80 or height < 80:
                print(f"  Skipping img {img_idx}: {width}x{height} (too small)")
                continue
            if width > 2000 and height > 2000:
                print(f"  Skipping img {img_idx}: {width}x{height} (background)")
                continue

            filename = f"pdf-page{page_num + 1}-img{img_idx}.{ext}"
            filepath = os.path.join(OUTPUT_DIR, filename)

            with open(filepath, "wb") as f:
                f.write(image_bytes)

            print(f"  Saved: {filename} ({width}x{height}, {len(image_bytes)} bytes)")

doc.close()
print("\nDone!")
