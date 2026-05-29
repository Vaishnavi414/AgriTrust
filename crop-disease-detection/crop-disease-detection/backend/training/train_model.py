"""
Train a leaf disease classifier on the PlantVillage folder layout using transfer learning.

Dataset folder layout (IMPORTANT):
    your_dataset/
      Apple___Apple_scab/
        image1.jpg
      Apple___healthy/
        ...

This script:
  1) Loads images with labels from subfolder names
  2) Trains a small classification head on top of a frozen pretrained CNN
  3) Saves:
        backend/model/<your_output>.h5      (Keras model)
        backend/model/class_names.json      (label order matches training)
        backend/model/training_meta.json    (backbone + image size for inference)

How to run (from the `backend/` directory):

    .venv\\Scripts\\activate
    python training/train_model.py --data-dir \"..\\dataset\\plantvillage\"

Why we save `training_meta.json`:
  Pretrained backbones (MobileNetV2 / MobileNetV3 / EfficientNet) use different `preprocess_input` rules.
  The API uses this file so prediction preprocessing matches training.

Default backbone:
  **mobilenet_v2** — frozen **ImageNet-pretrained** MobileNetV2 (`weights="imagenet"`), then a small trainable classification head.
  This is the standard beginner-friendly transfer-learning setup.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import tensorflow as tf

# Allow imports like `from config import ...` when running this file directly.
BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from config import IMG_SIZE, MODEL_FOLDER  # noqa: E402


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train PlantVillage disease classifier (transfer learning).")
    parser.add_argument(
        "--data-dir",
        type=str,
        required=True,
        help="Path to PlantVillage root folder that contains one subfolder per class.",
    )
    parser.add_argument(
        "--backbone",
        type=str,
        default="mobilenet_v2",
        choices=[
            "mobilenet_v2",
            "mobilenet_v3_small",
            "mobilenet_v3_large",
            "efficientnet_b0",
        ],
        help=(
            "Which ImageNet-pretrained CNN to reuse (frozen) for features. "
            "Recommended for beginners: mobilenet_v2 (fast, good accuracy)."
        ),
    )
    parser.add_argument("--epochs", type=int, default=15, help="Max training epochs (EarlyStopping may stop sooner).")
    parser.add_argument("--batch-size", type=int, default=32, help="Training batch size (lower if GPU runs out of memory).")
    parser.add_argument(
        "--learning-rate",
        type=float,
        default=1e-3,
        help="Adam learning rate for the new classification head.",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="plant_disease_model.h5",
        help="Output filename inside backend/model/ (should end with .h5).",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for the train/validation split reproducibility.",
    )
    parser.add_argument(
        "--no-augment",
        action="store_true",
        help="Disable light data augmentation (useful for debugging).",
    )
    return parser.parse_args()


def _preprocess_for_backbone(images: tf.Tensor, backbone: str) -> tf.Tensor:
    """Apply the same preprocessing TensorFlow uses for each architecture's ImageNet weights."""
    if backbone == "mobilenet_v2":
        return tf.keras.applications.mobilenet_v2.preprocess_input(images)
    if backbone in ("mobilenet_v3_small", "mobilenet_v3_large"):
        return tf.keras.applications.mobilenet_v3.preprocess_input(images)
    if backbone == "efficientnet_b0":
        return tf.keras.applications.efficientnet.preprocess_input(images)
    raise ValueError(f"Unknown backbone: {backbone}")


def _make_train_preprocess(backbone: str, augment: bool):
    data_augmentation = tf.keras.Sequential(
        [
            tf.keras.layers.RandomFlip("horizontal"),
            tf.keras.layers.RandomRotation(0.08),
        ],
        name="data_augmentation",
    )

    def _pipe(images: tf.Tensor, labels: tf.Tensor) -> tuple[tf.Tensor, tf.Tensor]:
        # `image_dataset_from_directory` yields float32 tensors with values in [0, 255].
        if augment:
            images = data_augmentation(images, training=True)
        images = _preprocess_for_backbone(images, backbone)
        return images, labels

    return _pipe


def _make_val_preprocess(backbone: str):
    def _pipe(images: tf.Tensor, labels: tf.Tensor) -> tuple[tf.Tensor, tf.Tensor]:
        images = _preprocess_for_backbone(images, backbone)
        return images, labels

    return _pipe


def _build_model(backbone: str, num_classes: int, image_shape: tuple[int, int, int]) -> tf.keras.Model:
    """
    Build: (preprocessed image) -> frozen backbone -> dropout -> softmax.

    We keep the backbone frozen for this beginner script to reduce overfitting and training complexity.
    Later you can "fine-tune" by unfreezing the last layers.
    """
    inputs = tf.keras.Input(shape=image_shape, name="image")

    if backbone == "mobilenet_v2":
        base = tf.keras.applications.MobileNetV2(
            input_shape=image_shape,
            include_top=False,
            weights="imagenet",
            pooling="avg",
        )
    elif backbone == "mobilenet_v3_small":
        base = tf.keras.applications.MobileNetV3Small(
            input_shape=image_shape,
            include_top=False,
            weights="imagenet",
            pooling="avg",
        )
    elif backbone == "mobilenet_v3_large":
        base = tf.keras.applications.MobileNetV3Large(
            input_shape=image_shape,
            include_top=False,
            weights="imagenet",
            pooling="avg",
        )
    elif backbone == "efficientnet_b0":
        base = tf.keras.applications.efficientnet.EfficientNetB0(
            input_shape=image_shape,
            include_top=False,
            weights="imagenet",
            pooling="avg",
        )
    else:
        raise ValueError(f"Unknown backbone: {backbone}")

    base.trainable = False

    x = base(inputs, training=False)
    x = tf.keras.layers.Dropout(0.2, name="head_dropout")(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax", name="predictions")(x)

    model = tf.keras.Model(inputs, outputs, name=f"plant_disease_{backbone}")
    return model


def main() -> int:
    args = _parse_args()

    data_dir = Path(args.data_dir).expanduser().resolve()
    if not data_dir.exists():
        print(f"ERROR: dataset folder not found:\n  {data_dir}", file=sys.stderr)
        return 2

    # Each class should be a separate subfolder.
    subfolders = [p for p in data_dir.iterdir() if p.is_dir()]
    if len(subfolders) < 2:
        print(
            "ERROR: expected `data_dir` to contain at least 2 class subfolders.\n"
            f"Found: {len(subfolders)} in {data_dir}",
            file=sys.stderr,
        )
        return 2

    print("\n=== Crop disease training (transfer learning) ===")
    print(f"Dataset:     {data_dir}")
    print(f"Classes:     {len(subfolders)}")
    print(f"Backbone:    {args.backbone}")
    print(f"Image size:  {IMG_SIZE}")
    print(f"Batch size:  {args.batch_size}")
    print(f"Epochs (max): {args.epochs}")
    print(f"Output:      {MODEL_FOLDER / args.output}")
    print("")

    AUTOTUNE = tf.data.AUTOTUNE
    image_shape = (int(IMG_SIZE[0]), int(IMG_SIZE[1]), 3)

    # Unbatched datasets so we can apply augmentation + preprocessing cleanly.
    train_raw = tf.keras.utils.image_dataset_from_directory(
        str(data_dir),
        labels="inferred",
        label_mode="int",
        validation_split=0.2,
        subset="training",
        seed=int(args.seed),
        image_size=IMG_SIZE,
        batch_size=None,
    )
    class_names = list(train_raw.class_names)
    num_classes = len(class_names)

    val_raw = tf.keras.utils.image_dataset_from_directory(
        str(data_dir),
        labels="inferred",
        label_mode="int",
        validation_split=0.2,
        subset="validation",
        seed=int(args.seed),
        image_size=IMG_SIZE,
        batch_size=None,
    )

    train_ds = train_raw.map(
        _make_train_preprocess(args.backbone, augment=not args.no_augment),
        num_parallel_calls=AUTOTUNE,
    )
    val_ds = val_raw.map(_make_val_preprocess(args.backbone), num_parallel_calls=AUTOTUNE)

    train_ds = train_ds.shuffle(1000, seed=int(args.seed)).batch(int(args.batch_size)).prefetch(AUTOTUNE)
    val_ds = val_ds.batch(int(args.batch_size)).prefetch(AUTOTUNE)

    model = _build_model(args.backbone, num_classes=num_classes, image_shape=image_shape)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=float(args.learning_rate)),
        loss=tf.keras.losses.SparseCategoricalCrossentropy(),
        metrics=[tf.keras.metrics.SparseCategoricalAccuracy(name="accuracy")],
    )

    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy",
            patience=4,
            restore_best_weights=True,
            verbose=1,
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=2,
            verbose=1,
        ),
    ]

    history = model.fit(train_ds, validation_data=val_ds, epochs=int(args.epochs), callbacks=callbacks, verbose=1)

    # Save artifacts next to the API (`backend/model/`).
    MODEL_FOLDER.mkdir(parents=True, exist_ok=True)
    out_path = MODEL_FOLDER / args.output

    # `save` includes architecture + weights in one file (good for beginners).
    model.save(out_path)
    print(f"\nSaved model: {out_path}")

    with (MODEL_FOLDER / "class_names.json").open("w", encoding="utf-8") as f:
        json.dump(class_names, f, indent=2)
    print(f"Saved labels: {MODEL_FOLDER / 'class_names.json'}")

    meta = {
        "backbone": str(args.backbone),
        "img_size": [int(IMG_SIZE[0]), int(IMG_SIZE[1])],
        "num_classes": int(num_classes),
        "trained_on": str(data_dir),
        "best_val_accuracy": float(max(history.history.get("val_accuracy", [0.0]))),
    }
    with (MODEL_FOLDER / "training_meta.json").open("w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    print(f"Saved meta:   {MODEL_FOLDER / 'training_meta.json'}")

    print("\nDone! Restart Flask and try Predict from the React app.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
