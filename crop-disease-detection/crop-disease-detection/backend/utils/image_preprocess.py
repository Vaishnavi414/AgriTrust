"""
Image preprocessing for model inference.

Why this module exists:
- Training and prediction MUST use the same preprocessing (size, color mode, scaling).
- Centralizing this prevents subtle bugs where the website "works" but accuracy is bad.

`training_meta.json` (saved during training) tells us which backbone was used so we can
apply the matching `preprocess_input` function from TensorFlow (imported only when needed).
"""

from __future__ import annotations

import io
import json
from pathlib import Path

import numpy as np
from PIL import Image

from config import IMG_SIZE, MODEL_FOLDER

_META_CACHE: dict | None = None


def _load_training_meta() -> dict:
    """
    Load `backend/model/training_meta.json` once and cache it.

    If missing, we fall back to legacy `/255` scaling (useful before you train the first model).
    """
    global _META_CACHE
    if _META_CACHE is not None:
        return _META_CACHE

    path: Path = MODEL_FOLDER / "training_meta.json"
    if not path.exists():
        _META_CACHE = {}
        return _META_CACHE

    with path.open(encoding="utf-8") as f:
        _META_CACHE = json.load(f)
    return _META_CACHE


def clear_training_meta_cache() -> None:
    """Mostly for tests: if you swap models at runtime, clear the cache."""
    global _META_CACHE
    _META_CACHE = None


def _apply_backbone_preprocess(array: np.ndarray, backbone: str) -> np.ndarray:
    """Run Keras `preprocess_input` for the trained backbone (lazy TensorFlow import)."""
    import tensorflow as tf  # noqa: PLC0415

    if backbone == "mobilenet_v2":
        return tf.keras.applications.mobilenet_v2.preprocess_input(array)
    if backbone in ("mobilenet_v3_small", "mobilenet_v3_large"):
        return tf.keras.applications.mobilenet_v3.preprocess_input(array)
    if backbone == "efficientnet_b0":
        return tf.keras.applications.efficientnet.preprocess_input(array)
    return array / 255.0


def pil_image_from_bytes(data: bytes) -> Image.Image:
    """Decode raw bytes into a PIL image (RGB handled in preprocessing)."""
    return Image.open(io.BytesIO(data))


def preprocess_pil_image(pil_image: Image.Image) -> np.ndarray:
    """
    Convert a PIL image into a batch tensor suitable for Keras models.

    Output shape: (1, height, width, 3)

    Steps:
    1) RGB — some PNGs have alpha channels; models expect 3 channels.
    2) Resize — match training resolution (usually 224×224).
    3) Apply backbone-specific preprocessing from `training_meta.json` when present.
       If meta is missing, we scale pixel values to [0, 1] for backward compatibility.
    """
    meta = _load_training_meta()
    size = meta.get("img_size")
    if isinstance(size, list) and len(size) == 2:
        height, width = int(size[0]), int(size[1])
    else:
        height, width = int(IMG_SIZE[0]), int(IMG_SIZE[1])

    image_rgb = pil_image.convert("RGB")
    # PIL expects (width, height)
    image_rgb = image_rgb.resize((width, height))

    array = np.asarray(image_rgb, dtype=np.float32)
    backbone = meta.get("backbone")

    if backbone in ("mobilenet_v2", "mobilenet_v3_small", "mobilenet_v3_large", "efficientnet_b0"):
        array = _apply_backbone_preprocess(array, backbone)
    else:
        array = array / 255.0

    return np.expand_dims(array, axis=0)
