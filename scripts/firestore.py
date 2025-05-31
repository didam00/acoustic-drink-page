from google.cloud import firestore
import json
import re
from pathlib import Path

# 서비스 계정 키 경로 (절대경로나 상대경로)
db = firestore.Client.from_service_account_json("../key/firebase-service-account.json")
video_collection = db.collection("videos")

def find_empty_ingredients():
    # videos 컬렉션의 모든 문서를 가져옵니다
    docs = video_collection.stream()
    
    empty_ingredients = []
    for doc in docs:
        data = doc.to_dict()
        # ingredients 필드가 없거나 빈 배열인 경우
        if 'ingredients' not in data or not data['ingredients']:
            empty_ingredients.append({
                'name': data.get('name', '이름 없음'),
                'id': doc.id
            })
    
    if empty_ingredients:
        print("\n재료가 비어있는 칵테일 목록:")
        for cocktail in empty_ingredients:
            print(f"- {cocktail['name']} (ID: {cocktail['id']})")
        print(f"\n총 {len(empty_ingredients)}개의 칵테일이 재료 정보가 없습니다.")
    else:
        print("재료가 비어있는 칵테일이 없습니다.")

if __name__ == "__main__":
    find_empty_ingredients()

