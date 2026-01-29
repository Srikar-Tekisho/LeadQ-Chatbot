import urllib.request
import json
import ssl

def verify_health():
    url = "http://127.0.0.1:5002/health"
    try:
        print(f"Checking health at {url}...")
        with urllib.request.urlopen(url, timeout=5) as response:
            print(f"Status: {response.status}")
            print(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Health check failed: {e}")

if __name__ == "__main__":
    verify_health()
