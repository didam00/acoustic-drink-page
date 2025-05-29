import { SortType, SortDirection, SortOption } from './SortSection';
import { IngredientItem } from './IngredientCategory';

export interface IngredientSubcategory {
  label: string;
  items: IngredientItem[];
}

export interface IngredientCategory {
  label: string;
  subcategories: {
    [key: string]: IngredientSubcategory;
  };
}

export interface IngredientsTree {
  [key: string]: IngredientCategory;
}

export interface FilterSidebarProps {
  search: string;
  setSearch: (v: string) => void;
  sort: SortOption;
  onSortChange: (newSort: SortOption) => void;
  allIngredients: string[];
  selectedIngredients: string[];
  onIngredientsChange: (ingredients: string[], categories: string[]) => void;
  selectedCategories: string[];
}

export type { SortType, SortDirection, SortOption, IngredientItem }; 