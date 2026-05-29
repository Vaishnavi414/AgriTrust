
# Training the disease classifier (PlantVillage layout)

This folder contains the training script for the TensorFlow/Keras model used by `POST /api/predict`.

## 1) Get the dataset

The PlantVillage dataset is large. Common options:

- **Kaggle**: search for “Plant Village” or “PlantVillage”, download, unzip.
- **Academic / original hosting**: use the source your course or lab recommends.

### Folder layout you need

After unzip, you want a root folder that contains **one subfolder per class**, for example:

```text
plantvillage/
  Apple___Apple_scab/
  Apple___Black_rot/
  Apple___healthy/
  ...
```

Some downloads include extra nesting (for example `PlantVilllage/color/...`).  
**The value you pass to `--data-dir` must be the folder that directly contains the class folders.**

Suggested location in this repo:

```text
crop-disease-detection/dataset/plantvillage/<class folders here>
```

## 2) Activate your backend virtual environment

From the `backend/` folder:

```powershell
cd c:\Users\Srushti\Desktop\crop-disease-detection\backend
.\.venv\Scripts\Activate.ps1
```

## 3) Run training

Training uses **transfer learning**: a **frozen** backbone loaded with **ImageNet** weights (`weights="imagenet"`), plus a small trainable head for your PlantVillage classes.

Example (adjust the path to your dataset):

```powershell
python training\train_model.py --data-dir "..\dataset\plantvillage"
```

### Pretrained backbones (`--backbone`)

| Value | Notes |
|-------|--------|
| **`mobilenet_v2`** (default) | Fast, light, great default for laptops / CPU training |
| **`mobilenet_v3_small`** | Newer MobileNet, smaller / faster |
| **`mobilenet_v3_large`** | Newer MobileNet, heavier, often a bit more accurate |
| **`efficientnet_b0`** | Strong baseline; slightly heavier than MobileNetV2 |

Example with another MobileNet:

```powershell
python training\train_model.py --data-dir "..\dataset\plantvillage" --backbone mobilenet_v3_small
```

### Other useful options

```text
--epochs 15
--batch-size 32
--learning-rate 0.001
--output plant_disease_model.h5
--no-augment                 (debug only)
```

## 4) Outputs (saved automatically)

Files are written to `backend/model/`:

- **`plant_disease_model.h5`**: trained model (or whatever you pass to `--output`)
- **`class_names.json`**: label strings in the exact order the model uses internally
- **`training_meta.json`**: backbone name + image size (used so inference preprocessing matches training)

## 5) Quick sanity checks

- Training should end with `val_accuracy` noticeably above random guessing.
- Restart Flask after training so the API loads the new weights.
- If you replace the model, keep `class_names.json` and `training_meta.json` in sync with the same training run (the script does this automatically).
