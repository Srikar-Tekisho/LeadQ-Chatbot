"""
Process chatbot mascot image - final combined approach:
1. Replace ALL gray-ish checker pixels with green (wider tolerance)
2. Run rembg on modified image
3. Post-process to remove any remaining checker artifacts
"""
from PIL import Image
import numpy as np
import os
from io import BytesIO
from rembg import remove
from scipy import ndimage


INPUT_PATH = r"C:\Users\DELL\.gemini\antigravity\brain\b3e6e785-f299-41b8-8b5b-e48939e79967\media__1772003147336.jpg"
OUTPUT_PATH = r"d:\LeadQ Chatbot\frontend\src\assets\chatbot-mascot.png"


def process_image(input_path, output_path):
    img_orig = Image.open(input_path).convert("RGB")
    orig_data = np.array(img_orig, dtype=np.float32)
    h, w = orig_data.shape[:2]
    
    r, g, b = orig_data[:,:,0], orig_data[:,:,1], orig_data[:,:,2]
    max_rgb = np.maximum(np.maximum(r, g), b)
    min_rgb = np.minimum(np.minimum(r, g), b)
    chroma = max_rgb - min_rgb
    brightness = (r + g + b) / 3.0
    
    # Step 1: Replace checker with green screen  
    print("Step 1: Replacing checker with green screen...")
    modified = np.array(img_orig).copy()
    green = np.array([0, 177, 64], dtype=np.uint8)  # Standard green screen
    
    # Pure gray checker: chroma < 25, brightness 40-210
    pure_checker = (chroma < 25) & (brightness > 40) & (brightness < 210)
    modified[pure_checker] = green
    
    # Tinted checker: chroma 25-80, and adjacent to pure checker
    # Dilate pure checker mask progressively and fill tinted pixels
    filled = pure_checker.copy()
    for expansion in range(8):
        near = ndimage.binary_dilation(filled, iterations=3)
        # Tinted candidates: moderate chroma, not part of highly saturated robot parts
        tinted = near & ~filled & (chroma < 80) & (brightness > 40) & (brightness < 210)
        if tinted.sum() == 0:
            break
        filled |= tinted
        modified[tinted] = green
    
    print(f"  Total pixels replaced with green: {filled.sum()}")
    
    # Step 2: Run rembg
    print("Step 2: Running rembg...")
    buf = BytesIO()
    Image.fromarray(modified).save(buf, format="PNG")
    buf.seek(0)
    rembg_output = remove(buf.read())
    result_img = Image.open(BytesIO(rembg_output)).convert("RGBA")
    result = np.array(result_img)
    
    # Step 3: Post-process - remove remaining checker and green artifacts
    print("Step 3: Post-processing...")
    r_r, g_r, b_r, a_r = result[:,:,0].astype(float), result[:,:,1].astype(float), result[:,:,2].astype(float), result[:,:,3]
    
    # Remove green remnants
    is_green = (g_r > r_r + 30) & (g_r > b_r + 30) & (g_r > 100) & (a_r > 0)
    result[is_green, 3] = 0
    
    # Remove any remaining gray checker pixels that survived
    opaque = result[:,:,3] > 128
    orig_at_surviving = orig_data.copy()
    r_o, g_o, b_o = orig_at_surviving[:,:,0], orig_at_surviving[:,:,1], orig_at_surviving[:,:,2]
    max_o = np.maximum(np.maximum(r_o, g_o), b_o)
    min_o = np.minimum(np.minimum(r_o, g_o), b_o)
    chroma_o = max_o - min_o
    bright_o = (r_o + g_o + b_o) / 3.0
    
    remaining_checker = opaque & (chroma_o < 30) & (bright_o > 40) & (bright_o < 190)
    # Only remove if they're in a cluster (avoid removing single pixels on robot)
    labeled, num = ndimage.label(remaining_checker)
    for i in range(1, num + 1):
        region = labeled == i
        if region.sum() >= 10:  # Only remove clusters of 10+
            result[region, 3] = 0
    
    remaining_removed = np.sum(result[remaining_checker, 3] == 0)
    print(f"  Green remnants: {is_green.sum()}, remaining checker clusters: {remaining_removed}")
    
    # Step 4: Crop to content + padding
    print("Step 4: Cropping...")
    alpha = result[:,:,3]
    rows = np.any(alpha > 0, axis=1)
    cols = np.any(alpha > 0, axis=0)
    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    
    # Add 10px padding
    pad = 10
    rmin = max(0, rmin - pad)
    rmax = min(h - 1, rmax + pad)
    cmin = max(0, cmin - pad)
    cmax = min(w - 1, cmax + pad)
    
    cropped = result[rmin:rmax+1, cmin:cmax+1]
    
    # Save
    output_img = Image.fromarray(cropped, "RGBA")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    output_img.save(output_path, "PNG", optimize=True)
    
    total = cropped.shape[0] * cropped.shape[1]
    transparent = np.sum(cropped[:,:,3] == 0)
    print(f"\nSaved to: {output_path}")
    print(f"Size: {output_img.size}")
    print(f"Transparent: {transparent}/{total} ({transparent/total*100:.1f}%)")


if __name__ == "__main__":
    process_image(INPUT_PATH, OUTPUT_PATH)
