export interface Ingredient {
  name: string;
  alter: string[];
  children?: Ingredient[];
}

// JSON 파일 로드 함수
export async function loadIngredients(): Promise<string[]> {
  const res = await fetch("/json/ingredients.json");
  const data = await res.json();

  // 모든 후보 재료명(동의어 포함) 준비 (공백 제거)
  const ingredient_list: string[] = [];

  function addIngredient(ing: Ingredient) {
    const names = [ing.name, ...(ing.alter ?? [])];
    ingredient_list.push(...names);
    if (ing.children) {
      for (const child of ing.children) {
        addIngredient(child);
      }
    }
  }

  for (const ing of data) {
    addIngredient(ing);
  }

  ingredient_list.sort((a, b) => b.length - a.length);

  return ingredient_list;
}

export async function highlightIngredients(recipeText: string): Promise<string> {
  const ingredient_list: string[] = await loadIngredients();
  const raw_ingredient_list: string[] = ingredient_list.map(ing => ing.replaceAll(" ", "").toLowerCase());

  // '-'와 '\n' 사이 구간 추출
  const lines = recipeText.split("\n");
  let result: string[] = [];

  for (const line of lines) {
    if (!line.trim().startsWith("-")) {
      result.push(line);
      continue;
    }

    // 공백/대소문자 무시한 라인
    const raw = line.replace(/\s+/g, "").toLowerCase();
    let foundIdx = -1;
    let foundWord = '';
    let originalWord = '';
    for (let i = 0; i < raw_ingredient_list.length; i++) {
      if (raw.includes(raw_ingredient_list[i])) {
        foundIdx = i;
        foundWord = raw_ingredient_list[i];
        originalWord = ingredient_list[i];
        break; // 여러 단어가 들어있어도 첫 번째만 감쌈
      }
    }
    if (foundIdx === -1) {
      result.push(line.trim());
      continue;
    }

    let normIdx = 0;
    let start = -1, end = -1;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === ' ') continue;
      if (line[i].toLowerCase() === foundWord[normIdx]) {
        if (normIdx === 0) start = i;
        normIdx++;
        if (normIdx === foundWord.length) {
          end = i + 1;
          break;
        }
      } else if (normIdx > 0) {
        i = start;
        normIdx = 0;
        start = -1;
      }
    }
    if (start !== -1 && end !== -1) {
      const newLine = line.slice(0, start) + `<span class='highlight'>${originalWord}</span>` + line.slice(end);
      result.push(newLine.trim());
    } else {
      result.push(line.trim());
    }
  }

  return result.join("\n");
}