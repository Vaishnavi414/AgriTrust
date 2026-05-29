"""Simple health check endpoint for monitoring and frontend connectivity tests."""

from __future__ import annotations

from flask import Blueprint, jsonify

from utils.model_loader import model_is_available

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health():
    """
    Returns OK if the server is running.

    `model_ready` tells the UI whether predictions can run yet (requires a `.h5` file).
    """
    return jsonify(
        {
            "status": "ok",
            "model_ready": model_is_available(),
            "message": "Backend is running.",
        }
    )
