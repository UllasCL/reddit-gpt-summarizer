#!/usr/bin/env python3
"""
Test script for the Reddit GPT Summarizer API
"""

import requests
import json

def test_api():
    """Test the API endpoints"""
    
    base_url = "http://localhost:8000"
    
    # Test health endpoint
    print("Testing health endpoint...")
    response = requests.get(f"{base_url}/")
    print(f"Health check: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    
    # Test summarize endpoint
    print("\nTesting summarize endpoint...")
    test_url = "https://www.reddit.com/r/mildlyinfuriating/comments/1mdp51h/someone_has_access_to_my_phones_screen/"
    
    params = {
        "url": test_url,
        "model": "gpt-3.5-turbo",
        "max_summaries": 2,
        "chunk_length": 1000,
        "max_tokens": 1000
    }
    
    try:
        response = requests.get(f"{base_url}/summarize", params=params)
        print(f"Summarize API: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("Success!")
            print(f"Title: {result.get('original_title')}")
            print(f"Subreddit: {result.get('subreddit')}")
            print(f"Processing time: {result.get('processing_time')}s")
            print(f"Summary length: {len(result.get('summary', ''))} characters")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error testing API: {e}")

if __name__ == "__main__":
    test_api() 