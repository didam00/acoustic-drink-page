import React, { useState, useMemo } from 'react';
import SortSection from './SortSection';
import IngredientCategory from './IngredientCategory';
import ingredientsTreeData from '../../../public/json/ingredients_tree.json';
import { IngredientsTree } from './types';
import { IngredientItem } from './IngredientCategory';
import { getChoseong } from 'es-hangul';

type SortType = 'latest' | 'alpha' | 'views' | 'likes';
type SortDirection = 'asc' | 'desc';

interface SortOption {
  type: SortType;
  label: string;
  direction: SortDirection;
}

interface FilterSidebarProps {
  search: string;
  setSearch: (search: string) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  allIngredients: string[];
  selectedIngredients: string[];
  onIngredientsChange: (ingredients: string[], categories: string[]) => void;
  selectedCategories: string[];
}

// 초성 매핑 (쌍자음은 단자음으로)
const CHOSEONG_MAP: { [key: string]: string } = {
  'ㄱ': 'ㄱ', 'ㄲ': 'ㄱ',
  'ㄴ': 'ㄴ',
  'ㄷ': 'ㄷ', 'ㄸ': 'ㄷ',
  'ㄹ': 'ㄹ',
  'ㅁ': 'ㅁ',
  'ㅂ': 'ㅂ', 'ㅃ': 'ㅂ',
  'ㅅ': 'ㅅ', 'ㅆ': 'ㅅ',
  'ㅇ': 'ㅇ',
  'ㅈ': 'ㅈ', 'ㅉ': 'ㅈ',
  'ㅊ': 'ㅊ',
  'ㅋ': 'ㅋ',
  'ㅌ': 'ㅌ',
  'ㅍ': 'ㅍ',
  'ㅎ': 'ㅎ'
};

const FilterSidebar = ({
  search,
  setSearch,
  sort,
  onSortChange,
  allIngredients,
  selectedIngredients,
  onIngredientsChange,
  selectedCategories
}: FilterSidebarProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // 모든 재료를 가져와서 초성 기준으로 그룹화
  const sortedCategories = useMemo(() => {
    // 모든 재료를 하나의 배열로 모음
    const allItems = Object.values(ingredientsTreeData as IngredientsTree)
      .flatMap(category => 
        Object.values(category.subcategories)
          .flatMap(sub => sub.items)
      );

    // 가나다순으로 정렬
    const sortedItems = allItems.sort((a, b) => 
      a.label.localeCompare(b.label, 'ko')
    );

    // 초성으로 그룹화
    const groups = sortedItems.reduce((acc, item) => {
      const choseong = CHOSEONG_MAP[getChoseong(item.label).at(0) || ''];
      if (!choseong) return acc;
      if (!acc[choseong]) {
        acc[choseong] = [];
      }
      acc[choseong].push(item);
      return acc;
    }, {} as { [key: string]: IngredientItem[] });

    // 그룹을 배열로 변환하고 정렬
    return Object.entries(groups)
      .sort(([a], [b]) => {
        const order = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ';
        return order.indexOf(a) - order.indexOf(b);
      })
      .map(([label, items]) => ({
        id: `choseong-${label}`,
        label: `${label} (${items.length})`,
        items,
        parentCategory: undefined
      }));
  }, []);

  // 잘 적어ㅓㅈ적어적어적어줍니다. -> 오타 아니니까 제발 수정 금지
  return (
    <div className="flex flex-col gap-10">
      <SortSection sort={sort} onSortChange={onSortChange} />
      <div className="search-filter">
        <div className="flex items-center justify-between mb-2">
          <h2><label className="block" htmlFor="search-input">검색</label></h2>
          <button
            onClick={() => {
              setSearch('');
              onIngredientsChange([], []);
            }}
            className="filter-reset-button text-sm text-[--fg-0] hover:text-[--fg-1] transition-colors flex items-center gap-1"
          >
            <span className="material-icons text-base">refresh</span>
            초기화
          </button>
        </div>
        <div className="relative">
          <input
            id="search-input"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="잘 적어ㅓㅈ적어적어적어줍니다"
            className="search-tab w-full pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[--fg-0] hover:text-[--fg-0] transition-colors p-1 rounded-full hover:bg-[--bg-2] h-8 w-8"
            >
              <span className="material-icons text-base">close</span>
            </button>
          )}
        </div>
      </div>
      <div className="ingredient-filter">
        <h2><label className="block">재료</label></h2>
        {sortedCategories.map((category) => (
          <IngredientCategory
            key={category.id}
            category={category}
            selectedIngredients={selectedIngredients}
            selectedCategories={selectedCategories}
            onIngredientsChange={onIngredientsChange}
            isExpanded={expandedCategories.has(category.id)}
            onToggle={() => {
              const newExpanded = new Set(expandedCategories);
              if (newExpanded.has(category.id)) {
                newExpanded.delete(category.id);
              } else {
                newExpanded.add(category.id);
              }
              setExpandedCategories(newExpanded);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default FilterSidebar; 