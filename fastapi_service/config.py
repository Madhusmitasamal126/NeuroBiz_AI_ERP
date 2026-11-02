
"""Configuration for the NeuroBiz AI FastAPI service."""

import os
from pathlib import Path

from dotenv import load_dotenv


# --------------------------------------------------
# Project paths
# --------------------------------------------------

# Expected project structure:
# D:\Neurobiz_AI_ERP\
#     .env
#     fastapi_service\
#         config.py

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Root environment file
ENV_FILE = PROJECT_ROOT / ".env"

# Load environment variables without overriding variables
# already configured in the operating system.
load_dotenv(dotenv_path=ENV_FILE, override=False)


# --------------------------------------------------
# Django API configuration
# --------------------------------------------------

DJANGO_API_URL = os.getenv(
    "DJANGO_API_URL",
    "http://127.0.0.1:8000",
).strip().rstrip("/")


# --------------------------------------------------
# OpenAI configuration
# --------------------------------------------------

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()

OPENAI_MODEL = (
    os.getenv("OPENAI_MODEL", "gpt-4.1-mini").strip()
    or "gpt-4.1-mini"
)


def openai_key_configured() -> bool:
    """Return True when an OpenAI API key is configured."""
    return bool(OPENAI_API_KEY)


# --------------------------------------------------
# React frontend CORS configuration
# --------------------------------------------------

FRONTEND_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]


# --------------------------------------------------
# Configuration validation
# --------------------------------------------------

if not DJANGO_API_URL:
    DJANGO_API_URL = "http://127.0.0.1:8000"

if not OPENAI_MODEL:
    OPENAI_MODEL = "gpt-4.1-mini"
