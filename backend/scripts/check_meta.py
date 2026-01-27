import imageio.v3 as iio

INPUT_PATH = "src/assets/chatbot-icon.webm"

try:
    meta = iio.immeta(INPUT_PATH, plugin="pyav")
    print(f"Meta: {meta}")
    
    props = iio.improps(INPUT_PATH, plugin="pyav")
    print(f"Props: {props}")
except Exception as e:
    print(f"Error: {e}")
