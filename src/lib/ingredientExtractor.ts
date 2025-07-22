import fs from 'fs';
import path from 'path';

export interface Ingredient {
  name: string;
  alter: string[];
}

// JSON 파일 로드 함수
function loadIngredients(): Ingredient[] {
  try {
    // Next.js의 public 디렉토리는 빌드 시 루트 디렉토리로 복사됨
    const filePath = path.join(process.cwd(), 'public', 'json', 'ingredients.json');
    if (!fs.existsSync(filePath)) {
      console.warn('ingredients.json 파일을 찾을 수 없습니다.');
      return [];
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data;
  } catch (error) {
    console.error('ingredients_tree.json 파일을 불러오는 중 오류 발생:', error);
    return [];
  }
}

const INGREDIENT_LIST: Ingredient[] = loadIngredients();

export function extractIngredients(recipeText: string): string[] {
  // '-'와 '\n' 사이 구간 추출
  const pattern = /-(.*?)(?=\n|$)/g;
  const matches = [...recipeText.matchAll(pattern)];
  const foundIngredients: string[] = [];
  
  // 모든 후보 재료명(동의어 포함) 준비 (공백 제거)
  const candidates: [string, string][] = [];
  for (const ing of INGREDIENT_LIST) {
    const names = [ing.name, ...(ing.alter || [])];
    for (const n of names) {
      candidates.push([n.replace(/\s+/g, ""), ing.name]);
    }
  }
  
  // 길이 내림차순(긴 이름 우선 매칭)
  candidates.sort((a, b) => b[0].length - a[0].length);

  for (const match of matches) {
    const section = match[1].trim().replace(/\s+/g, "");
    const matched: [number, number, string][] = [];
    
    for (const [cand, repName] of candidates) {
      let start = 0;
      while (true) {
        const idx = section.indexOf(cand, start);
        if (idx === -1) break;
        
        const end = idx + cand.length;
        let overlap = false;
        
        for (const [s, e] of matched) {
          if (!(end <= s || idx >= e)) {
            overlap = true;
            break;
          }
        }
        
        if (!overlap) {
          matched.push([idx, end, repName]);
        }
        
        start = end;
      }
    }
    
    for (const [, , rep] of matched.sort((a, b) => a[0] - b[0])) {
      if (!foundIngredients.includes(rep)) {
        foundIngredients.push(rep);
      }
    }
  }
  
  return foundIngredients;
} 