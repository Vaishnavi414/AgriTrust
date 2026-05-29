"""
Flask application entrypoint.

Run (from the `backend/` folder):
    ..venv\\Scripts\\activate
    python app.py

Why `create_app()` exists:
- This pattern (application factory) is common in real Flask projects.
- It makes testing easier later and keeps setup code organized.
"""

from __future__ import annotations

import logging
import os
import traceback

# Quieter TensorFlow logs when ML loads (first /api/predict only).
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")

from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from config import MAX_CONTENT_LENGTH, UPLOAD_FOLDER
from routes.health import health_bp
from routes.predict import predict_bp
from routes.upload import upload_bp


def create_app() -> Flask:
    app = Flask(__name__)

    # Flask built-in upload size guard (returns 413 if exceeded)
    app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

    # Where uploads are stored (see `routes/upload.py`)
    app.config["UPLOAD_FOLDER"] = str(UPLOAD_FOLDER)

    # CORS: allows your React dev server to call this API.
    # For production, replace "*" with your real frontend domain.
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=False,
    )

    # Make sure upload directory exists at startup (friendlier for beginners).
    UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

    # Register routes (each blueprint is a mini-module of endpoints)
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(upload_bp, url_prefix="/api")
    app.register_blueprint(predict_bp, url_prefix="/api")

    @app.errorhandler(413)
    def too_large(_e):
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Uploaded file is too large for the server limit.",
                    "code": "PAYLOAD_TOO_LARGE",
                }
            ),
            413,
        )

    @app.errorhandler(404)
    def not_found(_e):
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Endpoint not found. Try /api/health.",
                    "code": "NOT_FOUND",
                }
            ),
            404,
        )

    @app.errorhandler(Exception)
    def unhandled_exception(err):
        # Never turn normal HTTP errors (404, 405, etc.) into a 500 JSON blob.
        if isinstance(err, HTTPException):
            return (
                jsonify(
                    {
                        "success": False,
                        "error": err.description,
                        "code": err.name.upper().replace(" ", "_"),
                    }
                ),
                err.code or 500,
            )

        # Log the real error on the server, return a safe message to clients.
        logging.exception("Unhandled error: %s", err)
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Unexpected server error.",
                    "code": "INTERNAL",
                    "details": traceback.format_exc() if app.debug else None,
                }
            ),
            500,
        )

    return app


# Useful for `flask --app app run` style commands
app = create_app()


if __name__ == "__main__":
    # `debug=True` is convenient while learning; turn it off in real production.
    # `use_reloader=False` to avoid hiding errors from the watchdog debugger
    app.run(debug=True, host="0.0.0.0", port=5000, use_reloader=False)
