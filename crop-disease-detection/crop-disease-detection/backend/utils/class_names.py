"""
Optional mapping from class index → human-readable label.

PlantVillage training typically produces many classes. After training, save a JSON list:

    backend/model/class_names.json

Example:
    ["Apple___Apple_scab", "Apple___Black_rot", "Apple___healthy", ...]

The list order MUST match the order used during training (usually alphabetical folder names).

Why separate file:
- You can retrain without changing Python code — just update the JSON.
"""

from __future__ import annotations

import json
from pathlib import Path

from config import MODEL_FOLDER


def class_names_path() -> Path:
    return MODEL_FOLDER / "class_names.json"


def load_class_names() -> list[str] | None:
    """Return class names if `class_names.json` exists; otherwise None."""
    path = class_names_path()
    if not path.exists():
        return None
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list) or not all(isinstance(x, str) for x in data):
        raise ValueError("class_names.json must be a JSON array of strings.")
    return data


def label_for_index(class_names: list[str] | None, index: int) -> str:
    """Safe label lookup with a fallback if labels are missing."""
    if class_names is None:
        return f"class_{index}"
    if 0 <= index < len(class_names):
        return class_names[index]
    return f"class_{index} (out of range)"
