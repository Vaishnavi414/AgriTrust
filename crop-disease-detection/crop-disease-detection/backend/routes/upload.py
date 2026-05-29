"""Image upload endpoint (stores files under `backend/uploads/`)."""

from __future__ import annotations

import uuid
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request

from utils.file_validation import allowed_file, is_nonempty_upload, safe_original_filename

upload_bp = Blueprint("upload", __name__)

# HTML form / Postman field name used for the file.
IMAGE_FIELD_NAME = "image"


@upload_bp.post("/upload")
def upload_image():
    """
    Upload an image.

    Request:
      - multipart/form-data
      - field name: `image`

    Response:
      - `{ success, filename, original_filename, message }`

    Why we rename files:
    - Original filenames can be unsafe or collide. UUID names are simple and safe.
    """
    file = request.files.get(IMAGE_FIELD_NAME)
    if not is_nonempty_upload(file):
        return (
            jsonify(
                {
                    "success": False,
                    "error": f"Missing file field '{IMAGE_FIELD_NAME}' or empty filename.",
                    "code": "NO_FILE",
                }
            ),
            400,
        )

    assert file is not None  # for type checkers; guarded by is_nonempty_upload
    original_name = file.filename or ""

    if not allowed_file(original_name):
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Unsupported file type. Use png, jpg, jpeg, gif, or webp.",
                    "code": "INVALID_TYPE",
                }
            ),
            400,
        )

    ext = original_name.rsplit(".", maxsplit=1)[-1].lower()
    stored_name = f"{uuid.uuid4().hex}.{ext}"

    upload_dir = Path(current_app.config["UPLOAD_FOLDER"])
    upload_dir.mkdir(parents=True, exist_ok=True)

    save_path = upload_dir / stored_name
    file.save(save_path)

    return (
        jsonify(
            {
                "success": True,
                "filename": stored_name,
                "original_filename": safe_original_filename(original_name),
                "message": "File uploaded successfully. You can now call /api/predict.",
            }
        ),
        200,
    )
