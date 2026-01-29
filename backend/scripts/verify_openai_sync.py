import os
from dotenv import load_dotenv
from openai import OpenAI

def test_openai_sync():
    # Load from the same location as main.py
    load_dotenv(dotenv_path="backend/.env")
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: No API Key found in backend/.env")
        return

    print(f"Loaded API Key: {api_key[:5]}...{api_key[-4:]}")

    try:
        client = OpenAI(api_key=api_key)
        print("Client initialized. Sending request...")
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "hi"}],
            stream=True
        )
        
        print("Stream connection established.")
        for chunk in response:
            content = chunk.choices[0].delta.content
            if content:
                print(content, end="", flush=True)
        print("\n\nSuccess!")
        
    except Exception as e:
        print("\n--------------------------")
        print(f"FAILED with error: {e}")
        print("--------------------------")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_openai_sync()
