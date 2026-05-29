# Dataset folder

Put **external datasets** here (they are usually too large for Git).

## PlantVillage (recommended for this project)

1. Download + unzip the PlantVillage dataset using Kaggle or your course instructions.
2. Create something like:

```text
dataset/
  plantvillage/
    Apple___Apple_scab/
    Apple___healthy/
    ...
```

3. Train using:

```powershell
cd ..\backend
.\.venv\Scripts\Activate.ps1
python training\train_model.py --data-dir "..\dataset\plantvillage"
```

**Tip**: your `--data-dir` must be the directory whose *immediate children* are the class folders.
