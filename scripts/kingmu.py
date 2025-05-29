# 📦 Namuwiki ABV Extractor (Streaming + Status Output)
# Requires: datasets, pandas
# pip install datasets pandas

from datasets import load_dataset
import re
import json
import pandas as pd
from tqdm import tqdm

# 🔹 Load local ingredients list
with open("ingredients_with_syn_array.json", "r", encoding="utf-8") as f:
    ingredient_list = json.load(f)

# 🔹 Search targets: name + synonyms
search_terms = set()
for item in ingredient_list:
    search_terms.add(item["name"])
    search_terms.update(item["syn"])

# 🔹 Regex for extracting ABV
abv_pattern = re.compile(r"(도수|알코올\s*도수)\s*[:\-]?\s*(약\s*)?(\d{1,2}(?:\.\d+)?)(\s*[%퍼센트])?", re.IGNORECASE)

# 🔹 Load namuwiki dataset in streaming mode (RAM-efficient)
dataset = load_dataset("heegyu/namuwiki", split="train", streaming=True)

# 🔹 Process and collect ABV info
extracted_abvs = {}
progress_bar = tqdm(dataset, desc="Searching Namuwiki", unit="entry")

for entry in progress_bar:
    title = entry["title"]
    if title in search_terms:
        matches = abv_pattern.findall(entry["text"])
        if matches:
            values = [float(m[2]) for m in matches]
            extracted_abvs[title] = max(values)
            progress_bar.set_postfix(found=title)

# 🔹 Merge into original list
final_data = []
for item in ingredient_list:
    candidates = [item["name"]] + item["syn"]
    abv = next((extracted_abvs.get(name) for name in candidates if name in extracted_abvs), item.get("abv", 0))
    final_data.append({
        "name": item["name"],
        "syn": item["syn"],
        "category": item["category"],
        "abv": abv if abv is not None else 0
    })

# 🔹 Save result
with open("ingredients_enriched_with_namuwiki_abv.json", "w", encoding="utf-8") as f:
    json.dump(final_data, f, ensure_ascii=False, indent=2)

pd.DataFrame(final_data).to_csv("ingredients_enriched_with_namuwiki_abv.csv", index=False, encoding="utf-8")

print("✅ 도수 정보 병합 완료! 'ingredients_enriched_with_namuwiki_abv.*' 파일을 확인하세요.")
