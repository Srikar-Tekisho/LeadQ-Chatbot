import os
import asyncio
from dotenv import load_dotenv
from openai import AsyncOpenAI

async def test_openai():
    load_dotenv(dotenv_path="backend/.env")
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("No API Key found")
        return

    client = AsyncOpenAI(api_key=api_key)
    print(f"Testing OpenAI connection with key: {api_key[:5]}...")
    
    try:
        stream = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "hi"}],
            stream=True
        )
        print("Stream created.")
        async for chunk in stream:
            content = chunk.choices[0].delta.content
            if content:
                print(f"Chunk: {content}")
        print("Stream finished.")
    except Exception as e:
        print(f"OpenAI Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_openai())
