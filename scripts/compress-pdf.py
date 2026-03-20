#!/usr/bin/env python3
"""Compress a PDF by re-encoding images at lower quality/resolution."""
import fitz
import sys
from io import BytesIO

INPUT = "/Users/fernandotrejo/Developer/Delicias/public/catalogo.pdf"
OUTPUT = "/Users/fernandotrejo/Developer/Delicias/public/catalogo-compressed.pdf"
MAX_DIM = 1600
JPEG_QUALITY = 65

doc = fitz.open(INPUT)
print(f"Input: {len(doc)} pages")

for page_num in range(len(doc)):
    page = doc[page_num]
    images = page.get_images(full=True)

    for img in images:
        xref = img[0]
        try:
            base = doc.extract_image(xref)
            if not base:
                continue

            w, h = base["width"], base["height"]
            img_bytes = base["image"]

            # Skip small images (logos, icons)
            if w < 200 and h < 200:
                continue

            # Open with PyMuPDF pixmap
            pix = fitz.Pixmap(img_bytes)

            # Convert CMYK or alpha to RGB
            if pix.n > 3:
                pix = fitz.Pixmap(fitz.csRGB, pix)

            # Scale down large images
            if w > MAX_DIM or h > MAX_DIM:
                scale = MAX_DIM / max(w, h)
                new_w = int(w * scale)
                new_h = int(h * scale)
                # Create scaled pixmap using matrix transform
                src_rect = fitz.IRect(0, 0, pix.width, pix.height)
                mat = fitz.Matrix(new_w / pix.width, new_h / pix.height)
                pix = fitz.Pixmap(pix, 0, 1)  # remove alpha if any
                if pix.n > 3:
                    pix = fitz.Pixmap(fitz.csRGB, pix)

            # Re-encode as JPEG
            jpeg_data = pix.tobytes("jpeg", jpg_quality=JPEG_QUALITY)

            # Replace in PDF
            doc.update_stream(xref, jpeg_data)
            # Update the image dictionary
            doc.xref_set_key(xref, "Filter", "/DCTDecode")
            doc.xref_set_key(xref, "ColorSpace", "/DeviceRGB")
            doc.xref_set_key(xref, "BitsPerComponent", "8")

        except Exception as e:
            print(f"  Skip xref {xref}: {e}")
            continue

    print(f"  Page {page_num + 1}/{len(doc)} done")

# Save with garbage collection and deflation
doc.save(OUTPUT, garbage=4, deflate=True, clean=True)
doc.close()

import os
in_size = os.path.getsize(INPUT) / (1024 * 1024)
out_size = os.path.getsize(OUTPUT) / (1024 * 1024)
print(f"\nInput:  {in_size:.1f} MB")
print(f"Output: {out_size:.1f} MB")
print(f"Reduction: {(1 - out_size/in_size)*100:.0f}%")
