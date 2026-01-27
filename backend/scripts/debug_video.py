import time
print(f"[{time.strftime('%X')}] Test Script started.")
import imageio.v3 as iio
print(f"[{time.strftime('%X')}] Imageio imported.")
import rembg
print(f"[{time.strftime('%X')}] Rembg imported.")

INPUT_PATH = "src/assets/chatbot-icon.webm"

try:
    print(f"[{time.strftime('%X')}] Checking file props...")
    props = iio.improps(INPUT_PATH, plugin="pyav")
    print(f"[{time.strftime('%X')}] Props: {props}")
except Exception as e:
    print(f"Error props: {e}")

try:
    print(f"[{time.strftime('%X')}] Initializing rembg session...")
    session = rembg.new_session()
    print(f"[{time.strftime('%X')}] Session initialized.")
except Exception as e:
    print(f"Error session: {e}")
