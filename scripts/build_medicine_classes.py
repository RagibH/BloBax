"""Build medicine_classes.json — 317 fixed classes, sequential order from Excel."""
import csv
import json
import re
from pathlib import Path

import pandas as pd

BASE = Path(__file__).resolve().parent.parent
EXCEL_PATH = BASE / 'Class_names_medicine.xlsx'
OUT_JSON = BASE / 'static/models/MobileNet_Models_for_Blobax/medicine_classes.json'
OUT_CSV = BASE / 'static/models/MobileNet_Models_for_Blobax/medicine_classes_317.csv'
NUM_CLASSES = 317


def strip_number_prefix(name: str) -> str:
    m = re.match(r'^\s*\d+\.\s*(.+)$', str(name).strip())
    return m.group(1).strip() if m else str(name).strip()


def load_excel_classes():
    df = pd.read_excel(EXCEL_PATH)
    col = df.columns[0]
    raw = [str(col).strip()] + [str(x).strip() for x in df[col].tolist()]
    if len(raw) != NUM_CLASSES:
        raise ValueError(f'Expected {NUM_CLASSES} entries in Excel, got {len(raw)}')

    classes = []
    for class_index, entry in enumerate(raw):
        classes.append({
            'class_index': class_index,
            'medicine': strip_number_prefix(entry),
        })
    return classes


def write_outputs(classes):
    json_data = [{'medicine': c['medicine']} for c in classes]
    with open(OUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)

    with open(OUT_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['class_index', 'medicine_name'])
        writer.writeheader()
        for c in classes:
            writer.writerow({'class_index': c['class_index'], 'medicine_name': c['medicine']})

    print(f'Wrote {len(classes)} classes (sequential 0–316)')
    print(f'  class 0   -> {classes[0]["medicine"]}')
    print(f'  class 1   -> {classes[1]["medicine"]}')
    print(f'  class 2   -> {classes[2]["medicine"]}')
    print(f'  class 316 -> {classes[316]["medicine"]}')


if __name__ == '__main__':
    write_outputs(load_excel_classes())
