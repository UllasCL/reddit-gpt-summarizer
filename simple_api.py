#!/usr/bin/env python3
"""
Simple FastAPI server for Reddit GPT Summarizer
"""

import sys
import os
import time
import re
from typing import Dict, Any

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import the necessary modules
from config import ConfigVars
from env import EnvVarsLoader
from log_tools import Logger
from generate_data import get_reddit_praw, generate_summaries, generate_complete_prompt, adjust_prompt_length
from data_types.summary import GenerateSettings
from llm_handler import complete_text
from utils.llm_utils import group_bodies_into_chunks, estimate_word_count, num_tokens_from_string

# Initialize FastAPI app
app = FastAPI(
    title="Reddit GPT Summarizer API",
    description="API for summarizing Reddit posts using GPT models",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize logger and config
logger = Logger.get_app_logger()
config = ConfigVars()
env_vars = EnvVarsLoader.load_env()


def convert_reddit_url_to_json(url: str) -> str:
    """Convert a Reddit URL to its JSON format"""
    # Remove trailing slash if present
    url = url.rstrip('/')
    
    # Check if it's already a JSON URL
    if url.endswith('.json'):
        return url
    
    # Convert regular Reddit URL to JSON format
    if '/comments/' in url:
        # Extract the comment ID from the URL
        match = re.search(r'/comments/([a-zA-Z0-9]+)/', url)
        if match:
            comment_id = match.group(1)
            # Get the subreddit from the URL
            subreddit_match = re.search(r'/r/([^/]+)/', url)
            if subreddit_match:
                subreddit = subreddit_match.group(1)
                return f"https://www.reddit.com/r/{subreddit}/comments/{comment_id}/.json"
    
    # If we can't parse it, return the original URL
    return url


def generate_clean_summary(
    settings: GenerateSettings,
    reddit_data: Dict[str, Any],
    logger: Logger
) -> str:
    """
    Generate a clean summary without internal processing details.
    """
    try:
        title = reddit_data["title"]
        selftext = reddit_data["selftext"] or "No selftext"
        subreddit = reddit_data["subreddit"]
        comments = reddit_data["comments"] or "No Comments"

        # Create a comprehensive prompt that includes all content
        comprehensive_prompt = f"""Summarize this Reddit post and its comments professionally and objectively.

Title: {title}

Post Content: {selftext}

Comments from r/{subreddit}:
{comments}

Please provide a comprehensive summary that covers:
1. The main topic and purpose of the post
2. Key points from the post content
3. Important discussions and reactions in the comments
4. Overall sentiment and community response
5. Any notable deals, offers, or information shared

Write a clear, well-structured summary that captures the essence of both the post and the community discussion."""

        # Calculate appropriate token limit for the comprehensive summary
        max_tokens = min(settings["max_token_length"], 2000)  # Allow more tokens for comprehensive summary

        # Generate the comprehensive summary
        summary = complete_text(
            prompt=comprehensive_prompt,
            max_tokens=max_tokens,
            settings=settings,
        )
        
        return summary

    except Exception as e:
        logger.error(f"Error generating clean summary: {e}")
        raise


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Reddit GPT Summarizer API",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/summarize")
async def summarize_reddit_post(
    url: str = Query(..., description="Reddit URL to summarize"),
    model: str = Query("gpt-3.5-turbo", description="LLM model to use"),
    max_summaries: int = Query(3, description="Maximum number of summaries to generate"),
    chunk_length: int = Query(1000, description="Token length for each chunk"),
    max_tokens: int = Query(1500, description="Maximum tokens per summary")
):
    """
    Summarize a Reddit post using GET request
    
    Example: /summarize?url=https://reddit.com/r/subreddit/comments/123&model=gpt-3.5-turbo
    """
    try:
        start_time = time.time()
        
        # Validate URL
        if not url.startswith("https://reddit.com") and not url.startswith("https://www.reddit.com"):
            raise HTTPException(status_code=400, detail="Invalid Reddit URL")
        
        # Convert URL to JSON format
        json_url = convert_reddit_url_to_json(url)
        logger.info(f"Converted URL: {url} -> {json_url}")
        
        # Create settings using base model
        settings: GenerateSettings = {
            "query": "Summarize this Reddit post and its comments professionally and objectively.",
            "chunk_token_length": chunk_length,
            "max_number_of_summaries": max_summaries,
            "max_token_length": max_tokens,
            "selected_model": model,
            "system_role": "You are a helpful assistant that summarizes Reddit posts professionally and objectively.",
            "max_context_length": 4000
        }
        
        # Get Reddit data
        logger.info(f"Fetching Reddit data for URL: {json_url}")
        reddit_data = get_reddit_praw(
            json_url=json_url,
            logger=logger
        )
        
        if not reddit_data:
            raise HTTPException(status_code=404, detail="Could not fetch Reddit data")
        
        # Generate clean summary
        logger.info("Generating clean summary")
        summary = generate_clean_summary(
            settings=settings,
            reddit_data=reddit_data,
            logger=logger
        )
        
        processing_time = time.time() - start_time
        
        return {
            "success": True,
            "summary": summary,
            "original_title": reddit_data["title"],
            "subreddit": reddit_data["subreddit"],
            "processing_time": round(processing_time, 2),
            "url": url,
            "model": model
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": time.time()}


if __name__ == "__main__":
    uvicorn.run(
        "simple_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 