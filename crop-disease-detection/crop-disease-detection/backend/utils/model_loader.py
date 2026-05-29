"""
Model loading utilities (lazy load, cached in memory).

Why lazy loading:
- TensorFlow + h5py import can take 10–30+ seconds on Windows (WMI / oneDNN).
- Flask should start immediately; TensorFlow loads only on the first /api/predict call.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from config import MODEL_FOLDER

logger = logging.getLogger(__name__)

# Cached model object (loaded on first predict request).
_model: Any | None = None
_model_path: Path | None = None


def _tensorflow():
    """Import TensorFlow only when needed (avoids slow startup in VS Code / Flask)."""
    import tensorflow as tf  # noqa: PLC0415

    return tf


def find_model_file() -> Path | None:
    """Pick the first `.h5` file inside `backend/model/`."""
    if not MODEL_FOLDER.exists():
        return None
    candidates = sorted(MODEL_FOLDER.glob("*.h5"))
    return candidates[0] if candidates else None


def load_keras_model() -> Any | None:
    """
    Load and cache the Keras model.

    Returns None if no `.h5` exists yet (normal before training).
    """
    global _model, _model_path

    if _model is not None:
        return _model

    path = find_model_file()
    if path is None:
        logger.warning("No .h5 model found in %s", MODEL_FOLDER)
        return None

    tf = _tensorflow()
    try:
        _model = tf.keras.models.load_model(path)
        _model_path = path
        logger.info("Loaded Keras model from %s", path)
    except Exception:
        logger.exception("Failed to load Keras model from %s", path)
        _model = None
        _model_path = None

    return _model


def get_loaded_model_path() -> Path | None:
    """Path of the cached model (if loaded successfully)."""
    return _model_path


def model_is_available() -> bool:
    """Cheap check without forcing a load: do we have a file on disk?"""
    return find_model_file() is not None
