"""
Parse model class labels into crop and disease (or healthy status).

Supported formats:
- PlantVillage: Crop___Disease  (e.g. Potato___Early_blight, Pepper__bell___healthy)
- Compact:    Crop_Disease     (e.g. Tomato_Early_blight, Apple_Black_rot, Tomato_healthy)
"""

from __future__ import annotations


def format_display_name(raw: str) -> str:
    """Turn snake_case fragments into Title Case words."""
    cleaned = raw.strip().strip("_")
    if not cleaned:
        return ""
    parts = [p for p in cleaned.replace("-", "_").split("_") if p]
    return " ".join(part.capitalize() for part in parts)


def _split_raw_parts(predicted_label: str) -> tuple[str, str] | None:
    label = predicted_label.strip()
    if not label:
        return None

    if "___" in label:
        crop_raw, disease_raw = label.split("___", 1)
        return crop_raw, disease_raw

    if "_" in label:
        crop_raw, disease_raw = label.split("_", 1)
        return crop_raw, disease_raw.lstrip("_")

    return None


def parse_plant_label(predicted_label: str) -> dict[str, str | bool | None]:
    """
    Extract crop and disease from a predicted class label.

    Returns:
        crop: display-ready crop name (or "Unknown crop" if truly unidentifiable)
        disease: display-ready disease name, or None when healthy
        is_healthy: whether the label indicates a healthy plant
        crop_unknown: True only when no crop could be parsed from the label
    """
    parts = _split_raw_parts(predicted_label)
    if parts is None:
        fallback = format_display_name(predicted_label) or predicted_label.strip()
        if not predicted_label.strip():
            return {
                "crop": "Unknown crop",
                "disease": None,
                "is_healthy": False,
                "crop_unknown": True,
            }
        return {
            "crop": "Unknown crop",
            "disease": fallback or "Unknown condition",
            "is_healthy": "healthy" in predicted_label.lower(),
            "crop_unknown": True,
        }

    crop_raw, disease_raw = parts
    crop = format_display_name(crop_raw)
    disease_token = disease_raw.strip("_").lower()
    is_healthy = disease_token == "healthy"

    if is_healthy:
        return {
            "crop": crop or "Unknown crop",
            "disease": None,
            "is_healthy": True,
            "crop_unknown": not bool(crop),
        }

    disease = format_display_name(disease_raw)
    return {
        "crop": crop or "Unknown crop",
        "disease": disease or "Unknown condition",
        "is_healthy": False,
        "crop_unknown": not bool(crop),
    }


def split_crop_and_disease(predicted_label: str) -> tuple[str, str]:
    """Backward-compatible helper used by remedies lookup."""
    parsed = parse_plant_label(predicted_label)
    crop = str(parsed["crop"])
    if parsed["is_healthy"]:
        return crop, "healthy"
    return crop, str(parsed["disease"] or "Unknown condition")
