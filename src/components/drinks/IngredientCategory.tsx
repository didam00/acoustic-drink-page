import React from 'react';

export interface IngredientItem {
  name: string;
  label: string;
  abv: number;
  syn: string[];
  category?: string;
}

interface IngredientCategoryProps {
  category: {
    id: string;
    label: string;
    items: IngredientItem[];
    parentCategory?: string;
  };
  selectedIngredients: string[];
  selectedCategories: string[];
  onIngredientsChange: (ingredients: string[], categories: string[]) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

const IngredientCategory = ({ 
  category, 
  selectedIngredients,
  selectedCategories,
  onIngredientsChange,
  isExpanded,
  onToggle
}: IngredientCategoryProps) => {
  const handleIngredientToggle = (ingredient: string, categoryLabel: string) => {
    if (selectedIngredients.includes(ingredient)) {
      // 현재 카테고리의 다른 선택된 재료들 확인
      const otherSelectedIngredientsInCategory = category.items
        .filter(item => item.name !== ingredient && selectedIngredients.includes(item.name))
        .map(item => item.name);

      const newIngredients = selectedIngredients.filter(i => i !== ingredient);
      
      // 현재 카테고리에 다른 선택된 재료가 없으면 카테고리 제거
      const newCategories = otherSelectedIngredientsInCategory.length === 0
        ? selectedCategories.filter(c => c !== category.label)
        : selectedCategories;

      onIngredientsChange(newIngredients, newCategories);
    } else {
      onIngredientsChange(
        [...selectedIngredients, ingredient],
        [...new Set([...selectedCategories, category.label])]
      );
    }
  };

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between ml-[-4] pl-1 pr-4 py-1.5 rounded-md hover:bg-[--bg-1] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={`material-icons text-base transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
            chevron_right
          </span>
          <h4 className="text-sm font-medium text-[--fg-2]">
            {category.label}
          </h4>
        </div>
        {category.items.some(item => selectedIngredients.includes(item.name)) && (
          <span className="w-2 h-2 rounded-full bg-[--p]"></span>
        )}
      </button>
      {isExpanded && (
        <div className="flex flex-wrap gap-2 mt-2 ml-6 mb-4">
          {category.items.map((item) => (
            <label
              key={item.name}
              className={`
                relative px-3 py-1.5 rounded-md text-sm
                transition-colors cursor-pointer
                ${selectedIngredients.includes(item.name) 
                  ? 'bg-[--p] text-[--bg-0]' 
                  : 'bg-[--bg-1] text-[--fg-1] hover:bg-[--bg-2]'
                }
              `}
            >
              <input
                type="checkbox"
                className="absolute opacity-0 w-0 h-0"
                checked={selectedIngredients.includes(item.name)}
                onChange={() => handleIngredientToggle(item.name, category.label)}
              />
              {item.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default IngredientCategory; 