"""
Application configuration for the Crop Disease Detection backend.

Why this file exists:
- Keeps paths, limits, and constants in ONE place so `app.py` and routes stay readable.
- Makes it easy to switch settings later (for example, MongoDB connection strings).
"""

from pathlib import Path

# Root folder of the backend package (the folder that contains this file).
BASE_DIR: Path = Path(__file__).resolve().parent

# Where uploaded images are stored (created automatically on startup if missing).
UPLOAD_FOLDER: Path = BASE_DIR / "uploads"

# Where trained `.h5` models and optional `class_names.json` live.
MODEL_FOLDER: Path = BASE_DIR / "model"

# Only these file extensions are accepted for uploads (basic security + fewer errors).
ALLOWED_EXTENSIONS: frozenset[str] = frozenset({"png", "jpg", "jpeg", "gif", "webp"})

# Reject uploads larger than this (protects your server from huge files).
# 16 MB is plenty for leaf images.
MAX_CONTENT_LENGTH: int = 16 * 1024 * 1024

# Input size for CNN (MobileNetV2 / EfficientNet typically use 224x224).
IMG_SIZE: tuple[int, int] = (224, 224)
