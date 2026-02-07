"""
Video Background Removal Script
Carefully removes background while preserving all video content.
Uses rembg with careful tuning to preserve the character.
Outputs PNG frames that can be used with CSS or reassembled.
"""

import cv2
import numpy as np
from pathlib import Path
import subprocess
import tempfile
import shutil
from PIL import Image
from rembg import remove, new_session
from tqdm import tqdm
import os

def check_ffmpeg():
    """Check if FFmpeg is available"""
    try:
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True)
        return True
    except FileNotFoundError:
        return False

def process_video_preserve_content(input_path: str, output_path: str):
    """
    Remove background from video while carefully preserving all character content.
    Uses conservative settings to avoid removing parts of the character.
    """
    
    print(f"Processing video: {input_path}")
    print("Using conservative settings to preserve character content...")
    
    # Open input video
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video: {input_path}")
    
    # Get video properties
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    print(f"Video properties: {width}x{height}, {fps} fps, {frame_count} frames")
    
    # Create temp directory for frames
    temp_dir = Path(tempfile.mkdtemp())
    frames_dir = temp_dir / "frames"
    frames_dir.mkdir(exist_ok=True)
    
    # Create rembg session - using u2net for general objects
    # This model is better for preserving content than human-specific ones
    session = new_session("u2net")
    
    print("Extracting and processing frames...")
    print("This may take a few minutes...")
    
    frame_idx = 0
    pbar = tqdm(total=frame_count, desc="Processing frames")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Convert BGR to RGB for rembg
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(frame_rgb)
        
        # Remove background with VERY conservative settings
        # Higher foreground threshold = keep MORE as foreground (character)
        # Lower background threshold = remove LESS as background
        # Smaller erode = less edge erosion (keep more detail)
        result = remove(
            pil_image,
            session=session,
            alpha_matting=True,
            alpha_matting_foreground_threshold=270,  # Very high - keep almost everything as foreground
            alpha_matting_background_threshold=5,    # Very low - only remove obvious background
            alpha_matting_erode_size=3,              # Minimal erosion
        )
        
        # Convert back to numpy array (RGBA)
        result_np = np.array(result)
        
        # Post-process: Ensure we haven't lost any significant content
        # by comparing with original and restoring semi-transparent areas
        original_np = np.array(pil_image)
        
        # Get the alpha channel
        if result_np.shape[2] == 4:
            alpha = result_np[:, :, 3]
            
            # Dilate the alpha slightly to catch any missed edges
            kernel = np.ones((3, 3), np.uint8)
            alpha_dilated = cv2.dilate(alpha, kernel, iterations=1)
            
            # Blend: where alpha was removed but dilated says keep, restore partially
            restore_mask = (alpha < 128) & (alpha_dilated > 50)
            result_np[restore_mask, 3] = 180  # Partial transparency for edge areas
        
        # Save as PNG with alpha
        output_frame_path = frames_dir / f"frame_{frame_idx:06d}.png"
        # Convert RGBA to BGRA for OpenCV
        result_bgra = cv2.cvtColor(result_np, cv2.COLOR_RGBA2BGRA)
        cv2.imwrite(str(output_frame_path), result_bgra)
        
        frame_idx += 1
        pbar.update(1)
    
    pbar.close()
    cap.release()
    
    print(f"Processed {frame_idx} frames")
    
    # Check if FFmpeg is available
    has_ffmpeg = check_ffmpeg()
    
    if has_ffmpeg:
        print("Encoding video with transparency using FFmpeg...")
        
        output_temp = temp_dir / "output.webm"
        
        # Use FFmpeg to create WebM with VP9 and alpha channel
        ffmpeg_cmd = [
            "ffmpeg",
            "-y",  # Overwrite output
            "-framerate", str(fps),
            "-i", str(frames_dir / "frame_%06d.png"),
            "-c:v", "libvpx-vp9",
            "-pix_fmt", "yuva420p",  # Pixel format with alpha
            "-b:v", "3M",            # Higher bitrate for quality
            "-auto-alt-ref", "0",    # Required for alpha
            "-an",                   # No audio
            "-quality", "good",
            "-cpu-used", "2",
            str(output_temp)
        ]
        
        try:
            result = subprocess.run(ffmpeg_cmd, check=True, capture_output=True, text=True)
            shutil.copy(str(output_temp), output_path)
            print(f"✓ Output saved to: {output_path}")
        except subprocess.CalledProcessError as e:
            print(f"FFmpeg error: {e.stderr}")
            print("Trying fallback encoding...")
            
            # Fallback without alpha
            ffmpeg_cmd_fallback = [
                "ffmpeg", "-y",
                "-framerate", str(fps),
                "-i", str(frames_dir / "frame_%06d.png"),
                "-c:v", "libvpx-vp9",
                "-b:v", "3M",
                "-an",
                str(output_temp)
            ]
            subprocess.run(ffmpeg_cmd_fallback, check=True)
            shutil.copy(str(output_temp), output_path)
            print(f"✓ Output saved (without alpha): {output_path}")
    else:
        print("\n⚠ FFmpeg not found!")
        print("To install FFmpeg on Windows:")
        print("  1. Download from https://ffmpeg.org/download.html")
        print("  2. Or use: winget install FFmpeg")
        print("  3. Or use: choco install ffmpeg")
        print()
        print(f"Frames have been saved to: {frames_dir}")
        print(f"Total frames: {frame_idx}")
        print()
        
        # Don't delete temp dir if FFmpeg not available
        print("You can manually encode with:")
        print(f'  ffmpeg -framerate {fps} -i "{frames_dir}\\frame_%06d.png" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 3M -auto-alt-ref 0 -an "{output_path}"')
        return str(frames_dir)
    
    # Cleanup
    shutil.rmtree(temp_dir)
    print("✓ Cleanup complete")
    return output_path


def quick_test(input_path: str, output_dir: str):
    """
    Process just a few frames to test quality before full processing.
    """
    print(f"Quick test - processing 5 frames from: {input_path}")
    
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video: {input_path}")
    
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Get 5 evenly spaced frames
    test_frames = [0, frame_count//4, frame_count//2, 3*frame_count//4, frame_count-1]
    
    session = new_session("u2net")
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    for idx, frame_num in enumerate(test_frames):
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
        ret, frame = cap.read()
        if not ret:
            continue
        
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(frame_rgb)
        
        # Process with conservative settings
        result = remove(
            pil_image,
            session=session,
            alpha_matting=True,
            alpha_matting_foreground_threshold=270,
            alpha_matting_background_threshold=5,
            alpha_matting_erode_size=3,
        )
        
        # Save both original and processed for comparison
        pil_image.save(output_path / f"original_{idx}.png")
        result.save(output_path / f"processed_{idx}.png")
        print(f"  Saved frame {frame_num} -> original_{idx}.png, processed_{idx}.png")
    
    cap.release()
    print(f"\n✓ Test frames saved to: {output_path}")
    print("  Review the processed images to ensure character content is preserved.")


if __name__ == "__main__":
    import sys
    
    # Default paths
    input_video = r"e:\LeadQ chatbot\LeadQ-Chatbot\frontend\public\chatbot icon.mp4"
    output_video = r"e:\LeadQ chatbot\LeadQ-Chatbot\frontend\src\assets\chatbot-icon-transparent.webm"
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--test":
            # Quick test mode
            test_output = r"e:\LeadQ chatbot\LeadQ-Chatbot\frontend\temp_test_frames"
            quick_test(input_video, test_output)
        else:
            input_video = sys.argv[1]
            if len(sys.argv) > 2:
                output_video = sys.argv[2]
            process_video_preserve_content(input_video, output_video)
    else:
        # Full processing
        process_video_preserve_content(input_video, output_video)
