import urllib.request
import json
import sys

def verify_streaming():
    url = "http://127.0.0.1:5002/chat"
    print(f"Testing URL: {url}")
    
    payload = {
        "message": "tell me about pricing",
        "sessionId": "test-session"
    }
    
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    
    try:
        print("Sending request...")
        with urllib.request.urlopen(req) as response:
            print(f"Response Status: {response.status}")
            print("Headers:", response.getheaders())
            print("-" * 20)
            print("Stream Output:")
            
            chunk_count = 0
            for line in response:
                chunk = line.decode('utf-8').strip()
                if chunk:
                    print(f"Chunk {chunk_count}: {chunk}")
                    try:
                        # Verify it's valid JSON
                        json.loads(chunk)
                    except json.JSONDecodeError:
                        print(f"INVALID JSON: {chunk}")
                    chunk_count += 1
            
            print("-" * 20)
            print(f"Total chunks received: {chunk_count}")
            
            if chunk_count > 0:
                print("SUCCESS: Stream received.")
            else:
                print("FAILURE: No chunks received.")
                
    except urllib.error.URLError as e:
        print(f"Connection Error: {e}")
        print("Ensure the backend server is running on port 5002.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    verify_streaming()
