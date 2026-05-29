import requests
from pathlib import Path

# Test health endpoint
print("Testing /api/health...")
try:
    response = requests.get('http://localhost:5000/api/health', timeout=5)
    print(f"✓ Health: {response.json()}")
except Exception as e:
    print(f"✗ Error: {e}")

# Test predict endpoint
print("\nTesting /api/predict...")
image_path_root = Path(r"c:\Users\91932\Downloads\crop-disease-detection\crop-disease-detection\dataset\PlantVillage\Potato___healthy")
image_files = list(image_path_root.glob("*.JPG"))

if image_files:
    image_file = image_files[0]
    print(f"Using test image: {image_file.name}")
    
    with open(image_file, 'rb') as f:
        files = {'image': f}
        try:
            response = requests.post('http://localhost:5000/api/predict', files=files, timeout=120)
            print(f"Status: {response.status_code}")
            result = response.json()
            print(f"✓ Prediction response:")
            for key, value in result.items():
                if isinstance(value, dict):
                    print(f"  {key}:")
                    for k, v in value.items():
                        print(f"    {k}: {v}")
                elif isinstance(value, (list, tuple)):
                    print(f"  {key}: {value[:3]}..." if len(value) > 3 else f"  {key}: {value}")
                else:
                    print(f"  {key}: {value}")
        except Exception as e:
            print(f"✗ Error: {e}")
else:
    print("No test images found")
