import json
from pathlib import Path

def load_json_file(file_path: str) -> dict:
    """JSON 파일을 로드합니다."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json_file(data: dict, file_path: str) -> None:
    """데이터를 JSON 파일로 저장합니다."""
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def build_name_to_category(tree):
    """
    ingredients_tree.json에서 재료명(name) → 소분류(category, label) 매핑을 만듭니다.
    동명이인도 모두 매핑.
    """
    name_to_category = {}
    for main_id, main_data in tree.items():
        for sub_id, sub_data in main_data['subcategories'].items():
            sub_label = sub_data['label']
            for item in sub_data['items']:
                name = item['name']
                # 여러 소분류에 같은 이름이 있을 수 있으니 리스트로 관리
                if name not in name_to_category:
                    name_to_category[name] = []
                name_to_category[name].append(sub_id)
    return name_to_category

def update_ingredient_categories():
    # 파일 경로 설정
    script_dir = Path(__file__).parent
    ingredients_path = script_dir / 'ingredients.json'
    tree_path = script_dir / 'ingredients_tree.json'
    
    # 파일 존재 확인
    if not ingredients_path.exists():
        print(f"Error: {ingredients_path} 파일을 찾을 수 없습니다.")
        return
    if not tree_path.exists():
        print(f"Error: {tree_path} 파일을 찾을 수 없습니다.")
        return

    # 파일 로드
    ingredients = load_json_file(str(ingredients_path))
    tree = load_json_file(str(tree_path))
    name_to_category = build_name_to_category(tree)

    # 재료 카테고리 업데이트
    updated_count = 0
    for ing in ingredients:
        name = ing['name']
        # 여러 소분류에 있을 경우, 기존 category와 일치하는 소분류가 있으면 그대로, 없으면 첫 번째로
        if name in name_to_category:
            subcategories = name_to_category[name]
            if ing.get('category') in subcategories:
                new_category = ing['category']
            else:
                new_category = subcategories[0]
            if ing.get('category') != new_category:
                print(f"카테고리 업데이트: {name} ({ing.get('category')} → {new_category})")
                ing['category'] = new_category
                updated_count += 1

    # 업데이트된 데이터 저장
    save_json_file(ingredients, str(ingredients_path))
    print(f"\n총 {updated_count}개의 재료 카테고리가 업데이트되었습니다.")

if __name__ == '__main__':
    update_ingredient_categories() 