import json
from pathlib import Path
from collections import defaultdict

# 대분류-소분류 매핑 (필요시 수정)
CATEGORY_MAP = {
    'whiskey': ('base_spirits', 'whiskey', '베이스 스피릿', '위스키'),
    'rum': ('base_spirits', 'rum', '베이스 스피릿', '럼'),
    'gin': ('base_spirits', 'gin', '베이스 스피릿', '진'),
    'vodka': ('base_spirits', 'vodka', '베이스 스피릿', '보드카'),
    'tequila': ('base_spirits', 'tequila', '베이스 스피릿', '데킬라'),
    'other_spirits': ('base_spirits', 'other_spirits', '베이스 스피릿', '기타 증류주'),
    'liqueur': ('liqueurs', 'liqueur', '리큐르', '리큐르'),
    'fortified_and_bitter': ('fortified_and_bitter', 'fortified_and_bitter', '주정강화주/비터', '주정강화주/비터'),
    'mixers': ('mixers', 'mixers', '믹서', '믹서'),
    'spices_and_garnish': ('spices_and_garnish', 'spices_and_garnish', '가니시/향신료', '가니시/향신료'),
    'fruit': ('fruit', 'fruit', '과일/주스', '과일/주스'),
    'other': ('other', 'other', '기타', '기타'),
    'bitter': ('fortified_and_bitter', 'bitter', '주정강화주/비터', '비터'),
}

def main():
    script_dir = Path(__file__).parent
    src_path = script_dir / 'ingredients.json'
    dst_path = script_dir / 'ingredients_tree.json'

    with open(src_path, encoding='utf-8') as f:
        ingredients = json.load(f)

    tree = {}
    # 대분류-소분류 구조 생성
    for ing in ingredients:
        cat = ing['category']
        mapping = CATEGORY_MAP.get(cat, ('other', 'other', '기타', '기타'))
        main_id, sub_id, main_label, sub_label = mapping
        if main_id not in tree:
            tree[main_id] = {
                'label': main_label,
                'subcategories': {}
            }
        if sub_id not in tree[main_id]['subcategories']:
            tree[main_id]['subcategories'][sub_id] = {
                'label': sub_label,
                'items': []
            }
        # 소분류명(label)과 동일한 이름의 재료는 추가하지 않음
        if ing['name'] == sub_label:
            continue
        tree[main_id]['subcategories'][sub_id]['items'].append({
            'name': ing['name'],
            'label': ing['name'],
            'abv': ing.get('abv', 0),
            'syn': ing.get('syn', [])
        })

    with open(dst_path, 'w', encoding='utf-8') as f:
        json.dump(tree, f, ensure_ascii=False, indent=2)
    print(f"ingredients_tree.json 파일로 변환 완료!")

if __name__ == '__main__':
    main() 