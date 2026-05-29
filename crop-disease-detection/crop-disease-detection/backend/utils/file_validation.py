"""File upload validation helpers."""

from __future__ import annotations

from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

from config import ALLOWED_EXTENSIONS


def extension_from_filename(filename: str) -> str:
    """Return lowercase extension without dot, e.g. 'jpg'."""
    if "." not in filename:
        return ""
    return filename.rsplit(".", maxsplit=1)[-1].lower()


def allowed_file(filename: str) -> bool:
    """True if the upload extension is in the allowed set."""
    ext = extension_from_filename(filename)
    return ext in ALLOWED_EXTENSIONS


def is_nonempty_upload(file_storage: FileStorage | None) -> bool:
    """True if browser actually sent a file (not an empty part)."""
    return bool(file_storage and file_storage.filename)


def safe_original_filename(filename: str) -> str:
    """
    Make a filename safer for logging/headers.

    Note: For storage, prefer a random UUID name (see upload route) so we avoid
    collisions and weird paths.
    """
    return secure_filename(filename)
