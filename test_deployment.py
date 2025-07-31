#!/usr/bin/env python3
"""
Test script for the deployed Reddit GPT Summarizer API
"""
import requests
import json
import time

def test_deployed_api():
    """Test the deployed API endpoints"""
    
    # Base URL - update this with your actual Render URL
    base_url = "https://reddit-gpt-summarizer-api.onrender.com"
    
    print("🧪 Testing Deployed API...")
    print(f"📍 Base URL: {base_url}")
    print("-" * 50)
    
    # Test 1: Health Check
    print("1️⃣ Testing Health Check...")
    try:
        response = requests.get(f"{base_url}/", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)}")
            print("   ✅ Health check passed!")
        else:
            print(f"   ❌ Health check failed: {response.text}")
    except Exception as e:
        print(f"   ❌ Health check error: {e}")
    
    print()
    
    # Test 2: Summarize Endpoint
    print("2️⃣ Testing Summarize Endpoint...")
    test_url = "https://www.reddit.com/r/dealsforindia/comments/1mdsuys/deals_on_25_phones_under_15000/"
    
    params = {
        "url": test_url,
        "model": "gpt-3.5-turbo",
        "max_summaries": 1,
        "chunk_length": 1000,
        "max_tokens": 1500
    }
    
    try:
        start_time = time.time()
        response = requests.get(f"{base_url}/summarize", params=params, timeout=30)
        end_time = time.time()
        
        print(f"   Status: {response.status_code}")
        print(f"   Response Time: {end_time - start_time:.2f} seconds")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success')}")
            print(f"   Title: {data.get('original_title')}")
            print(f"   Subreddit: {data.get('subreddit')}")
            print(f"   Processing Time: {data.get('processing_time')}s")
            print(f"   Summary Length: {len(data.get('summary', ''))} characters")
            print("   ✅ Summarize endpoint passed!")
        else:
            print(f"   ❌ Summarize failed: {response.text}")
    except Exception as e:
        print(f"   ❌ Summarize error: {e}")
    
    print()
    print("🎯 Deployment Test Complete!")
    print("If both tests passed, your API is working correctly!")

if __name__ == "__main__":
    test_deployed_api() 