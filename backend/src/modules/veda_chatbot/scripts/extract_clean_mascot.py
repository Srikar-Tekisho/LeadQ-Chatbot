
import cv2
import numpy as np
from rembg import remove
from PIL import Image

def refined_clean():
    video_path = r"d:\LeadQ Chatbot\frontend\src\assets\chatbot-icon.webm"
    output_path = r"d:\LeadQ Chatbot\frontend\src\assets\chatbot-mascot.png"
    
    cap = cv2.VideoCapture(video_path)
    # Skip more frames to find a very clear pose (e.g. frame 30)
    for _ in range(30):
        cap.read()
    success, frame = cap.read()
    cap.release()
    
    if not success:
        return

    # Convert to RGB
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # 1. First pass: use rembg for general subject isolation
    pil_img = Image.fromarray(frame_rgb)
    print("Initial AI isolation...")
    isolated = remove(pil_img)
    isolated_np = np.array(isolated)
    
    # 2. Second pass: aggressive checkerboard removal
    # The checkerboard in the original is gray/white.
    # We want to keep anything that is saturated (cyan) or very dark (black visor) 
    # and be careful with white.
    
    # Convert isolated image to HSV to find saturation
    hsv = cv2.cvtColor(isolated_np[:,:,:3], cv2.COLOR_RGB2HSV)
    sat = hsv[:,:,1]
    val = hsv[:,:,2]
    
    # Mask for high saturation (cyan) or high/low value (visor/body)
    # Checkerboard is typically mid-gray (low saturation, mid value)
    mask = np.ones(isolated_np.shape[:2], dtype=bool)
    
    # Identify checkerboard-like areas: Low saturation AND mid-level brightness
    # (Checking for the specific gray of the checkerboard)
    checker_gray = (sat < 30) & (val > 50) & (val < 250)
    
    # We apply this only to pixels that are NOT clearly part of the robot subject
    # The subject has high saturation (cyan) OR very high brightness (white body) 
    # OR very low brightness (visor).
    subject_mask = (sat > 40) | (val > 252) | (val < 10)
    
    # Final alpha correction: make checkerboard pixels transparent
    alpha = isolated_np[:,:,3]
    alpha[checker_gray & ~subject_mask] = 0
    
    # 3. Clean up edges with a small erosion/dilation if needed
    kernel = np.ones((2,2), np.uint8)
    alpha = cv2.erode(alpha, kernel, iterations=1)
    alpha = cv2.dilate(alpha, kernel, iterations=1)
    
    isolated_np[:,:,3] = alpha
    
    # 4. Save
    result = Image.fromarray(isolated_np)
    result.save(output_path)
    print(f"Saved refined mascot to {output_path}")

if __name__ == "__main__":
    refined_clean()
