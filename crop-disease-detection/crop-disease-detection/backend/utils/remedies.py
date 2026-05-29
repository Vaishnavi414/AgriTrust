"""
Disease → precautions / treatment suggestions.

Why this exists:
- Neural networks predict a label; they don't explain what a farmer should do next.
- We map labels to practical advice. Start small, expand as you learn more.

Data source suggestion:
- As you train, print your class names and fill in entries here, or load from JSON later.
"""

from __future__ import annotations

from utils.label_parser import split_crop_and_disease


def _normalize_key(raw: str) -> str:
    return " ".join(raw.strip().lower().replace("_", " ").split())


def remedies_for_label(predicted_label: str) -> dict:
    """
    Return precaution + treatment text for a predicted class.

    For unknown labels, return sensible generic guidance (safe for beginners).
    """
    crop, disease = split_crop_and_disease(predicted_label)
    crop_key = _normalize_key(crop)
    disease_key = _normalize_key(disease)
    label_lower = predicted_label.lower()

    crop_bases: dict[str, dict[str, list[str]]] = {
        "apple": {
            "precautions": [
                "Maintain good air circulation in apple trees by pruning crowded limbs.",
                "Clean fallen leaves and fruit from around the tree to reduce overwintering spores.",
            ],
            "treatments": [
                "Use apple-specific fungicide programs recommended by your local extension.",
                "Plant resistant apple varieties when replanting or grafting.",
            ],
        },
        "tomato": {
            "precautions": [
                "Avoid overhead watering and water at the soil line to keep tomato foliage dry.",
                "Space tomato plants to improve airflow and reduce humidity around leaves.",
            ],
            "treatments": [
                "Apply tomato-approved fungicides or bactericides according to label directions.",
                "Remove heavily infected tomato foliage and destroy it away from the garden.",
            ],
        },
        "potato": {
            "precautions": [
                "Avoid planting potatoes in the same spot year after year to reduce disease buildup.",
                "Keep potato foliage dry and remove infected leaves promptly.",
            ],
            "treatments": [
                "Use potato-safe fungicides or crop protection products approved for your region.",
                "Rotate potatoes with non-host crops to break the disease cycle.",
            ],
        },
        "pepper bell": {
            "precautions": [
                "Avoid overhead irrigation and water early in the day so leaves can dry quickly.",
                "Keep bell pepper plants well spaced and remove any diseased material.",
            ],
            "treatments": [
                "Apply pepper-friendly fungicides if the disease is confirmed by a local expert.",
                "Choose resistant pepper cultivars for future plantings when possible.",
            ],
        },
    }

    disease_specific: dict[str, dict[str, list[str]]] = {
        "apple scab": {
            "precautions": [
                "Avoid overhead irrigation that keeps leaves wet for long periods.",
                "Remove and dispose of fallen infected leaves away from the orchard (reduces spores).",
            ],
            "treatments": [
                "Use appropriate fungicides per local extension guidance and label instructions.",
                "Improve air circulation by pruning dense canopy areas.",
            ],
        },
        "black rot": {
            "precautions": [
                "Sanitize pruning tools between cuts when disease is suspected.",
                "Remove mummified fruits and infected plant debris from the ground.",
            ],
            "treatments": [
                "Apply fungicide programs timed for your region (often starts early season).",
                "Consider resistant varieties for future plantings where available.",
            ],
        },
        "early blight": {
            "precautions": [
                "Avoid wet foliage and use mulch to prevent soil splash on plants.",
                "Rotate crops and avoid planting susceptible solanaceous crops in the same bed consecutively.",
            ],
            "treatments": [
                "Use tomato- or potato-safe fungicides according to label directions.",
                "Remove and destroy infected leaves to limit disease spread.",
            ],
        },
        "late blight": {
            "precautions": [
                "Keep potato and tomato plants dry and remove nearby volunteer plants.",
                "Avoid working in the garden when foliage is wet to prevent spread.",
            ],
            "treatments": [
                "Apply approved late blight fungicides immediately at first signs of disease.",
                "Destroy heavily infected plants and do not compost them.",
            ],
        },
    }

    precautions: list[str] = []
    treatments: list[str] = []

    if "healthy" in label_lower:
        if crop_key in crop_bases:
            precautions = [
                f"Keep monitoring your {crop.lower()} crop and maintain good hygiene.",
                *crop_bases[crop_key]["precautions"],
            ]
            treatments = [
                f"No treatment needed for healthy {crop.lower()} plants — continue routine care.",
                *crop_bases[crop_key]["treatments"],
            ]
        else:
            precautions = [
                "Keep monitoring: healthy today doesn't mean immune tomorrow.",
                "Continue good hygiene (tools, spacing, irrigation practices).",
            ]
            treatments = [
                "No treatment needed based on this prediction — maintain routine crop care.",
            ]
    else:
        if crop_key in crop_bases:
            precautions.extend(crop_bases[crop_key]["precautions"])
            treatments.extend(crop_bases[crop_key]["treatments"])

        matched_disease = next((k for k in disease_specific if k in disease_key), None)
        if matched_disease is not None:
            entry = disease_specific[matched_disease]
            precautions.extend(entry["precautions"])
            treatments.extend(entry["treatments"])

        if not precautions:
            precautions = [
                "Isolate/warn: if this is a greenhouse crop, reduce spread risk (tools, hands, water splash).",
                "Take clear close-up photos and track changes over a few days.",
            ]
        if not treatments:
            if crop_key:
                treatments = [
                    f"Identify the crop and disease with a local agricultural extension or plant pathologist for {crop}.",
                    "Follow label-approved fungicides/pesticides for your crop in your region (if applicable).",
                ]
            else:
                treatments = [
                    "Identify the crop and disease with a local agricultural extension or plant pathologist.",
                    "Follow label-approved fungicides/pesticides for your crop in your region (if applicable).",
                ]

    return {
        "crop_guess": crop,
        "disease_guess": disease,
        "precautions": precautions,
        "treatments": treatments,
    }
