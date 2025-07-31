"""
FastAPI application for Reddit GPT Summarizer API
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
from typing import Optional

from ..generate_data import generate_summary_data, get_reddit_praw
from ..data_types.summary import GenerateSettings
from ..config import ConfigVars
from ..log_tools import Logger

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

# Initialize logger
logger = Logger.get_app_logger()
config = ConfigVars()


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
        
        # Create settings using base model
        settings: GenerateSettings = {
            "query": "Summarize this Reddit post and its comments",
            "chunk_token_length": chunk_length,
            "max_number_of_summaries": max_summaries,
            "max_token_length": max_tokens,
            "selected_model": model,
            "system_role": "You are a helpful assistant that summarizes Reddit posts professionally and objectively.",
            "max_context_length": 4000
        }
        
        # Get Reddit data
        logger.info(f"Fetching Reddit data for URL: {url}")
        reddit_data = get_reddit_praw(
            json_url=url.replace("/comments/", "/comments.json"),
            logger=logger
        )
        
        if not reddit_data:
            raise HTTPException(status_code=404, detail="Could not fetch Reddit data")
        
        # Generate summary
        logger.info("Generating summary")
        summary = generate_summary_data(
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