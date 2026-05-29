"""
Prediction endpoint.

Supports:
1) multipart/form-data with field `image` (same as upload)
2) JSON body: `{ "filename": "abcd1234.jpg" }` pointing to a file already in /uploads
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from flask import Blueprint, current_app, jsonify, request
from PIL import Image
from werkzeug.utils import secure_filename

from utils.class_names import load_class_names, label_for_index
from utils.label_parser import parse_plant_label
from utils.file_validation import allowed_file, is_nonempty_upload
from utils.image_preprocess import preprocess_pil_image
from utils.model_loader import load_keras_model
from utils.remedies import remedies_for_label
from utils.severity import prediction_is_healthy, severity_from_prediction
from routes.upload import IMAGE_FIELD_NAME

predict_bp = Blueprint("predict", __name__)


def _json_error(message: str, code: str, status: int):
    return jsonify({"success": False, "error": message, "code": code}), status


def _load_image_from_disk(filename: str) -> Image.Image:
    safe_name = secure_filename(filename)
    path = Path(current_app.config["UPLOAD_FOLDER"]) / safe_name
    if not path.exists() or not path.is_file():
        raise FileNotFoundError("Saved upload not found.")
    return Image.open(path)


@predict_bp.post("/predict")
def predict():
    """
    Run CNN prediction on an image.

    Prerequisites:
    - Train a model and save `*.h5` into `backend/model/`
    - Optional: save `backend/model/class_names.json` with labels in training order
    """
    model = load_keras_model()
    if model is None:
        return _json_error(
            "No model found. Train a model and save it as a `.h5` file in backend/model/.",
            "MODEL_NOT_FOUND",
            503,
        )

    pil_image: Image.Image | None = None

    # Mode A: direct file upload
    file = request.files.get(IMAGE_FIELD_NAME)
    if is_nonempty_upload(file):
        assert file is not None
        if not allowed_file(file.filename or ""):
            return _json_error("Unsupported file type.", "INVALID_TYPE", 400)
        pil_image = Image.open(file.stream)

    # Mode B: predict an earlier saved upload by filename
    elif request.is_json:
        body = request.get_json(silent=True) or {}
        filename = body.get("filename")
        if not filename or not isinstance(filename, str):
            return _json_error(
                "Send JSON like { \"filename\": \"your_uploaded_file.jpg\" } "
                f"or multipart form-data with '{IMAGE_FIELD_NAME}'.",
                "MISSING_FILENAME",
                400,
            )
        try:
            pil_image = _load_image_from_disk(filename)
        except FileNotFoundError:
            return _json_error("That filename was not found on the server.", "FILE_NOT_FOUND", 404)
        except Exception:
            return _json_error("Could not read the image file.", "IMAGE_READ_ERROR", 400)
    else:
        return _json_error(
            f"Use multipart '{IMAGE_FIELD_NAME}' or JSON '{{\"filename\": \"...\"}}'.",
            "BAD_REQUEST_FORMAT",
            400,
        )

    if pil_image is None:
        return _json_error("No image available to predict.", "NO_IMAGE", 400)

    try:
        x = preprocess_pil_image(pil_image)
        preds = model.predict(x, verbose=0)[0]
    except Exception:
        return _json_error("Model prediction failed.", "PREDICTION_FAILED", 500)

    predicted_index = int(np.argmax(preds))
    confidence = float(preds[predicted_index])

    class_names = load_class_names()
    predicted_label = label_for_index(class_names, predicted_index)

    parsed = parse_plant_label(predicted_label)
    healthy = prediction_is_healthy(predicted_label)
    severity = severity_from_prediction(confidence, predicted_label)
    remedy = remedies_for_label(predicted_label)

    # Top-3 optional explainability for the UI
    top_indices = np.argsort(preds)[::-1][:3]
    top_predictions = []
    for idx in top_indices:
        idx_i = int(idx)
        lab = label_for_index(class_names, idx_i)
        top_predictions.append({"label": lab, "confidence": float(preds[idx_i])})

    return jsonify(
        {
            "success": True,
            "crop": parsed["crop"],
            "disease": None if parsed["is_healthy"] else parsed["disease"],
            "status": "Healthy" if parsed["is_healthy"] else None,
            "predicted_label": predicted_label,
            "healthy": healthy,
            "health_status": "healthy" if healthy else "unhealthy",
            "severity": severity,
            "confidence": confidence,
            "confidence_percent": round(confidence * 100, 2),
            "top_predictions": top_predictions,
            "precautions": remedy["precautions"],
            "treatments": remedy["treatments"],
        }
    )
