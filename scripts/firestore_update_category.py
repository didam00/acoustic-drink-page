from google.cloud import firestore
import json
import re
from pathlib import Path

db = firestore.Client.from_service_account_json("../key/firebase-service-account.json")
video_collection = db.collection("videos")

with open("ingredients.json", "r", encoding="utf-8") as f:
    ingredient_list = json.load(f)

tree_path = Path(__file__).parent / 'ingredients_tree.json'
if tree_path.exists():
    with open(tree_path, encoding='utf-8') as f:
        tree = json.load(f)
    subcategory_labels = []
    for main in tree.values():
        for sub in main['subcategories'].values():
            subcategory_labels.append(sub['label'])
else:
    subcategory_labels = []

ingredient_mapping = {}
for item in ingredient_list:
    ingredient_mapping[item["name"]] = item["name"]
    for syn in item["syn"]:
        ingredient_mapping[syn] = item["name"]

def extract_ingredients_from_text(recipe_text, ingredient_list, subcategory_labels=None):
    # 모든 후보 재료명(동의어 포함) 준비 (공백 제거)
    candidates = []
    for ing in ingredient_list:
        names = [ing['name']] + ing.get('syn', [])
        for n in names:
            candidates.append((n.replace(' ', ''), ing['name']))
    # 소분류 label도 후보에 추가
    if subcategory_labels:
        for label in subcategory_labels:
            candidates.append((label.replace(' ', ''), label))
    # 길이 내림차순(긴 이름 우선 매칭)
    candidates = sorted(set(candidates), key=lambda x: -len(x[0]))

    # '-'와 '\n' 사이 구간 추출
    pattern = r"-(.*?)(?=\n|$)"
    matches = re.finditer(pattern, recipe_text, re.DOTALL)
    found_ingredients = []
    for match in matches:
        section = match.group(1).strip().replace(' ', '')
        matched = []
        for cand, rep_name in candidates:
            start = 0
            while True:
                idx = section.find(cand, start)
                if idx == -1:
                    break
                end = idx + len(cand)
                overlap = False
                for s, e, _ in matched:
                    if not (end <= s or idx >= e):
                        overlap = True
                        break
                if not overlap:
                    matched.append((idx, end, rep_name))
                start = end
        for _, _, rep in sorted(matched):
            if rep not in found_ingredients:
                found_ingredients.append(rep)
    return found_ingredients

def update_cocktail_ingredients():
    # 모든 비디오 문서 가져오기
    docs = video_collection.stream()
    
    for doc in docs:
        data = doc.to_dict()
        if "recipeText" in data:
            # 재료 추출
            ingredients = extract_ingredients_from_text(data["recipeText"], ingredient_list, subcategory_labels)
            # Firestore 업데이트
            doc.reference.update({
                "ingredients": ingredients
            })
            print(f"Updated ingredients for {doc.id}: {ingredients}")

if __name__ == "__main__":
    update_cocktail_ingredients()
    print("✅ 모든 칵테일의 재료 정보가 업데이트되었습니다.")

