import os
import rembg
import imageio
import numpy as np
import time
import warnings

warnings.filterwarnings("ignore")

INPUT_PATH = "src/assets/chatbot-icon.webm"
OUTPUT_PATH = "src/assets/chatbot-icon-transparent.webm"

def process_video():
    print(f"[{time.strftime('%X')}] Script started.")
    
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
        
        # Use imageio writer to save frames as we go (saves memory!)
        # webm supports alpha if using appropriate codec/pixel format.
        # usually 'libvpx-vp9' and pixelformat 'yuva420p'.
        # imageio-ffmpeg usually handles 'transparent' logic if input is RGBA.
        writer = imageio.get_writer(OUTPUT_PATH, fps=fps, codec='libvpx-vp9', pixelformat='yuva420p')

        count = 0
        for frame in reader:
            count += 1
            if count % 10 == 0:
                print(f"[{time.strftime('%X')}] Processing frame {count}...")
            
            # frame is numpy array (H, W, 3) or (H, W, 4)
            # rembg output is (H, W, 4)
            output = rembg.remove(frame, session=session)
            
            writer.append_data(output)
            
            # Safety limit: removed for full processing
            if count % 100 == 0:
                print(f"[{time.strftime('%X')}] Processed {count} frames...")

        writer.close()
        print(f"[{time.strftime('%X')}] Done. Saved to {OUTPUT_PATH}")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    process_video()
