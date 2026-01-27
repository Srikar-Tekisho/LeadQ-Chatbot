import os
import rembg
import imageio
import numpy as np
import time
import warnings
from PIL import Image

warnings.filterwarnings("ignore")

INPUT_PATH = "src/assets/chatbot-icon.webm"
OUTPUT_PATH = "src/assets/chatbot-icon-transparent.webm"
TARGET_WIDTH = 256 # Optimization: Resize to meaningful size

def process_video():
    print(f"[{time.strftime('%X')}] Script started. Optimization: Resize to {TARGET_WIDTH}px width.")
    
    if not os.path.exists(INPUT_PATH):
        print("Input file not found.")
        return

    print(f"[{time.strftime('%X')}] Initializing rembg session...")
    try:
        session = rembg.new_session()
    except Exception as e:
        print(f"Error initializing rembg: {e}")
        return

    print(f"[{time.strftime('%X')}] Starting processing loop...")
    
    try:
        reader = imageio.get_reader(INPUT_PATH)
        fps = reader.get_meta_data().get('fps', 30)
        print(f"Video FPS: {fps}")
        
        writer = imageio.get_writer(OUTPUT_PATH, fps=fps, codec='libvpx-vp9', pixelformat='yuva420p')

        count = 0
        for frame in reader:
            count += 1
            if count % 50 == 0:
                print(f"[{time.strftime('%X')}] Processing frame {count}...")
            
            # frame is numpy array (H, W, 3)
            # Resize using PIL
            img = Image.fromarray(frame)
            aspect_ratio = img.height / img.width
            new_height = int(TARGET_WIDTH * aspect_ratio)
            # Use LANCZOS for high quality downscaling
            img_resized = img.resize((TARGET_WIDTH, new_height), Image.Resampling.LANCZOS)
            frame_resized = np.array(img_resized)
            
            # Remove background from resized frame (much faster!)
            output = rembg.remove(frame_resized, session=session)
            
            writer.append_data(output)
            
            # No frame limit this time, process all 1536 frames
            # At 256px, it should take ~0.1s per frame -> ~2.5 mins total.

        writer.close()
        print(f"[{time.strftime('%X')}] Done. Saved to {OUTPUT_PATH}")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    process_video()
