"""
Severity logic (beginner-friendly + honest about limitations).

Important note for beginners:
- True "disease severity" usually needs more than a single leaf photo classifier
  (for example, estimating affected leaf area). Until we add that, we use a simple
  heuristic based on model confidence and whether the prediction is "healthy".

This keeps the API stable now, and you can replace the internals later without
changing your React components.
"""

from __future__ import annotations


def prediction_is_healthy(predicted_label: str) -> bool:
    """
    Healthy classes use a `healthy` disease segment, e.g. `Apple___healthy` or `Tomato_healthy`.
    """
    from utils.label_parser import parse_plant_label

    return bool(parse_plant_label(predicted_label)["is_healthy"])


def severity_from_prediction(confidence: float, predicted_label: str) -> str:
    """
    Return one of: "none" | "mild" | "moderate" | "severe".

    Heuristic:
    - If healthy → severity is none.
    - If diseased → map confidence to severity buckets (placeholder logic).

    Why confidence is NOT true severity:
    - High confidence means the model is sure about the CLASS, not that the disease is worse.
    - We still use it as a simple starting point until you implement a better approach.
    """
    if prediction_is_healthy(predicted_label):
        return "none"

    if confidence >= 0.85:
        return "severe"
    if confidence >= 0.65:
        return "moderate"
    return "mild"
