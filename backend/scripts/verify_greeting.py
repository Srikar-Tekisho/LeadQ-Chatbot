import urllib.request
import json
import sys

def verify_greeting():
    url = "http://127.0.0.1:5002/chat"
    print(f"Testing URL: {url}")
    
    payload = {
        "message": "hi",
        "sessionId": "test-session-greeting"
    }
    
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    
    try:
        print("Sending request: 'hi'")
        with urllib.request.urlopen(req) as response:
            print(f"Response Status: {response.status}")
            
            chunk_count = 0
            full_content = ""
            for line in response:
                chunk = line.decode('utf-8').strip()
                if chunk:
                    try:
                        data = json.loads(chunk)
                        if data.get("type") == "content":
                            print(f"Content Chunk: {data['chunk']}")
                            full_content += data['chunk']
                        elif data.get("type") == "error": # Check for explicit error type if existing
                            print(f"Error Chunk: {data}")
                    except json.JSONDecodeError:
                        print(f"INVALID JSON: {chunk}")
                    chunk_count += 1
            
            print("-" * 20)
            print(f"Full response: {full_content}")
            
    except urllib.error.URLError as e:
        print(f"Connection Error: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    verify_greeting()
