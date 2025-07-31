"""Data types for the application."""

from typing import TypedDict, Union


class RedditData(TypedDict):
    """Data for a summary."""

    title: str
    selftext: Union[str, None]
    subreddit: str
    comments: Union[str, None]


class GenerateSettings(TypedDict):
    """Settings for generating a summary ds."""

    query: str
    chunk_token_length: int
    max_number_of_summaries: int
    max_token_length: int
    selected_model: str
    system_role: str
    max_context_length: int


class ModelConfig(TypedDict):
    """A model configuration."""

    name: str
    id: str
    default_chunk_token_length: int
    default_number_of_summaries: int
    max_token_length: int
