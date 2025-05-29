import React from 'react';

export type SortType = 'latest' | 'alpha' | 'views' | 'likes';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  type: SortType;
  label: string;
  direction: SortDirection;
}

interface SortSectionProps {
  sort: SortOption;
  onSortChange: (newSort: SortOption) => void;
}

const getSortLabel = (type: SortType): string => {
  switch (type) {
    case 'latest': return '최신순';
    case 'alpha': return '가나다순';
    case 'views': return '조회수';
    case 'likes': return '좋아요';
    default: return '';
  }
};

const SortSection = ({ sort, onSortChange }: SortSectionProps) => {
  const handleSortClick = (type: SortType) => {
    if (sort.type === type) {
      onSortChange({
        ...sort,
        direction: sort.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      onSortChange({
        type,
        direction: 'asc',
        label: getSortLabel(type)
      });
    }
  };

  return (
    <div className="mt-8">
      <h2><label className="block mb-2">정렬</label></h2>
      <div className="grid grid-cols-2 gap-2">
        {(['latest', 'alpha', 'views', 'likes'] as SortType[]).map((type) => (
          <button
            key={type}
            onClick={() => handleSortClick(type)}
            className={`sort-button ${type === sort.type ? 'active' : ''} flex justify-between`}
          >
            <span>{getSortLabel(type)}</span>
            {sort.type === type && (
              <span className={`material-icons text-sm transition-transform ${sort.direction === 'desc' ? 'desc' : 'asc'}`}>
                arrow_upward
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortSection; 