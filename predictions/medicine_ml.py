"""
MobileNetV2 medicine classification — PyTorch inference (224×224, 317 fixed classes).

Class 0 = medicine #1, class 316 = medicine #317 (from Class_names_medicine.xlsx).
No subclasses or categories — exactly 317 classes.
"""

import json
import os
import re

import numpy as np
import torch
import torch.nn as nn
from django.conf import settings
from PIL import Image
from torchvision import models, transforms

MODEL_DIR = os.path.join(
    settings.BASE_DIR, 'static', 'models', 'MobileNet_Models_for_Blobax'
)
WEIGHTS_PATH = os.path.join(MODEL_DIR, 'best_mobilenetv2.pth')
CLASSES_PATH = os.path.join(MODEL_DIR, 'medicine_classes.json')

IMG_SIZE = 224
NUM_CLASSES = 317

MEDICINE_MODEL = None
MEDICINE_CLASSES = None

INFER_TRANSFORM = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


def _clean_label(name: str) -> str:
    """Strip leading numbering like '42. Napa' from display names."""
    if not name:
        return ''
    m = re.match(r'^\s*\d+\.\s*(.+)$', str(name).strip())
    return m.group(1).strip() if m else str(name).strip()


def _load_classes():
    global MEDICINE_CLASSES
    if MEDICINE_CLASSES is not None:
        return MEDICINE_CLASSES
    try:
        with open(CLASSES_PATH, encoding='utf-8') as f:
            MEDICINE_CLASSES = json.load(f)
    except Exception as e:
        print(f'[Blobax ML] WARNING: Could not load medicine classes — {e}')
        MEDICINE_CLASSES = []
    return MEDICINE_CLASSES


def _load_model():
    global MEDICINE_MODEL
    if MEDICINE_MODEL is not None:
        return MEDICINE_MODEL
    try:
        model = models.mobilenet_v2(weights=None)
        model.classifier[1] = nn.Linear(model.last_channel, NUM_CLASSES)
        state = torch.load(WEIGHTS_PATH, map_location='cpu', weights_only=False)
        model.load_state_dict(state)
        model.eval()
        MEDICINE_MODEL = model
    except Exception as e:
        print(f'[Blobax ML] WARNING: Could not load medicine model — {e}')
        MEDICINE_MODEL = None
    return MEDICINE_MODEL


def _confidence_level(probability: float) -> str:
    if probability >= 70:
        return 'high'
    if probability >= 40:
        return 'medium'
    return 'low'


def _lookup_class(idx: int) -> str:
    classes = _load_classes()
    if 0 <= idx < len(classes):
        entry = classes[idx]
        name = entry if isinstance(entry, str) else entry.get('medicine', '')
        return _clean_label(name) or f'Class {idx}'
    return f'Class {idx}'


def predict_medicine(image_file) -> dict:
    model = _load_model()
    if model is None:
        return {'error': 'Medicine model not loaded. Check model files in static/models.'}

    try:
        image = Image.open(image_file).convert('RGB')
    except Exception:
        return {'error': 'Could not read image. Please upload a valid JPG or PNG file.'}

    try:
        tensor = INFER_TRANSFORM(image).unsqueeze(0)
        with torch.no_grad():
            logits = model(tensor)[0]
            probs = torch.softmax(logits, dim=0).numpy()
    except Exception as e:
        return {'error': f'Prediction failed: {e}'}

    top_indices = np.argsort(probs)[::-1][:5]
    top_predictions = []
    for idx in top_indices:
        name = _lookup_class(int(idx))
        top_predictions.append({
            'medicine': name,
            'probability': round(float(probs[idx]) * 100, 1),
        })

    best = top_predictions[0]
    return {
        'label': best['medicine'],
        'medicine': best['medicine'],
        'probability': best['probability'],
        'confidence_level': _confidence_level(best['probability']),
        'top_predictions': top_predictions,
        'class_index': int(top_indices[0]),
    }
