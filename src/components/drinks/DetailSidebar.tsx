import { useState, useEffect, useMemo } from 'react';
import { VideoData } from '@/types/video';
import ingredientsTreeData from '../../../public/json/ingredients_tree.json';
import { IngredientsTree } from './types';

interface DetailSidebarProps {
  selectedVideo: VideoData;
  onClose: () => void;
  onShare: () => void;
  isOpen?: boolean;
  onCloseEnd?: () => void;
}

const DetailSidebar = ({ selectedVideo, onClose, onShare, isOpen = true, onCloseEnd }: DetailSidebarProps) => {
  const [currentVideo, setCurrentVideo] = useState(selectedVideo);
  const [isClosing, setIsClosing] = useState(false);

  // 현재 비디오의 재료와 관련된 모든 텍스트를 가져오는 함수
  const getHighlightTargets = useMemo(() => {
    if (!currentVideo.ingredients) return [];
    
    const targets = new Set<string>();
    
    // 현재 비디오의 재료들을 순회
    currentVideo.ingredients.forEach(ingredientName => {
      // 기본 재료명 추가
      targets.add(ingredientName);
      
      // ingredients_tree.json에서 해당 재료 찾기
      Object.values(ingredientsTreeData as IngredientsTree).forEach(category => {
        // 카테고리 라벨 추가
        targets.add(category.label);
        
        Object.values(category.subcategories).forEach(sub => {
          // 서브카테고리 라벨 추가
          targets.add(sub.label);
          
          // 현재 재료와 일치하는 항목 찾기
          const foundItem = sub.items.find(item => 
            item.label === ingredientName || 
            (item.syn && item.syn.includes(ingredientName))
          );
          
          if (foundItem) {
            // 동의어 추가
            if (foundItem.syn) {
              foundItem.syn.forEach(synonym => {
                targets.add(synonym);
              });
            }
          }
        });
      });
    });
    
    // 긴 단어부터 매칭하도록 정렬
    return Array.from(targets)
      .filter(label => label.trim())
      .sort((a, b) => b.length - a.length);
  }, [currentVideo.ingredients]);

  // 레시피 텍스트에서 재료를 하이라이트 처리하는 함수
  const highlightIngredients = (text: string) => {
    if (!text) return '';
    
    let result = text;
    const processedRanges: [number, number][] = [];

    getHighlightTargets.forEach(target => {
      // 띄어쓰기를 제거한 타겟 문자열 생성
      const normalizedTarget = target.replace(/\s+/g, '');
      // 띄어쓰기를 무시하는 정규식 패턴 생성
      const pattern = normalizedTarget.split('').join('\\s*');
      // 하이픈 뒤의 재료 이름만 매칭 (하이픈 제외)
      const regex = new RegExp(`(?<=-\\s*)(${pattern})(?=\\s|$)`, 'g');
      
      let match;
      while ((match = regex.exec(result)) !== null) {
        const start = match.index;
        const end = start + match[1].length; // match[1]은 캡처된 그룹(재료 이름)만 사용
        
        // 이미 처리된 범위와 겹치는지 확인 (HTML 태그 제외한 실제 텍스트 기준)
        const isOverlapping = processedRanges.some(([rangeStart, rangeEnd]) => {
          const currentStart = start;
          const currentEnd = end;
          return (
            (currentStart >= rangeStart && currentStart < rangeEnd) ||
            (currentEnd > rangeStart && currentEnd <= rangeEnd) ||
            (currentStart <= rangeStart && currentEnd >= rangeEnd)
          );
        });
        
        if (!isOverlapping) {
          const before = result.slice(0, start);
          const after = result.slice(start + match[0].length); // 전체 매칭된 문자열 길이 사용
          const highlighted = `<span class="ingredient-text">${match[1]}</span>`;
          result = before + highlighted + after;
          
          // 실제 텍스트 위치만 저장
          processedRanges.push([start, end]);
          // 다음 검색 시작 위치를 실제 매칭된 재료 이름 끝으로 설정
          regex.lastIndex = start + match[0].length;
        }
      }
    });
    
    return result;
  };

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    } else {
      setIsClosing(true);
    }
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (isClosing && onCloseEnd) {
      onCloseEnd();
    }
  };

  useEffect(() => {
    if (selectedVideo.id !== currentVideo.id) {
      setCurrentVideo(selectedVideo);
    }
  }, [selectedVideo]);

  return (
    <div
      className={`detail-sidebar ${isClosing ? 'custom-slide-out-right' : 'custom-slide-in-right'}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="flex justify-between items-center">
        <h2 className="block text-[--p]">{currentVideo.name}</h2>
        <button onClick={onClose} className="text-xl font-black transition-colors text-[--fg-0] hover:text-white mr-1 hidden md:block">
          <span className="material-icons">close</span>
        </button>
      </div>
      <div className="rounded-lg overflow-hidden border border-[--p] mb-4 p-glow-2">
        <iframe
          width="100%"
          height="300"
          src={`https://www.youtube.com/embed/${currentVideo.id}`}
          title={currentVideo.name}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      {/* <button onClick={onShare} className="mb-4 w-full py-2 rounded bg-green-600 text-white font-bold">공유하기</button> */}
      <div>
        {currentVideo.ingredients && currentVideo.ingredients.length > 0 && (
          <div className="my-8">
            <h3 className="mb-2 flex gap-1">
              <span className="tossface block mt-[-2]">🧪</span> 사용된 재료
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentVideo.ingredients.map((ingredient, index) => (
                <span 
                  key={index}
                  className="px-3 py-1.5 rounded-md text-sm bg-[--bg-1] text-[--fg-1] hover:bg-[--bg-2] transition-colors cursor-pointer"
                >
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}
        <h3 className="mb-2 flex gap-1"><span className="tossface block mt-[-2]">🍸</span> 레시피</h3>
        <div 
          className="whitespace-pre-wrap leading-2 select-text"
          dangerouslySetInnerHTML={{ 
            __html: highlightIngredients(currentVideo.recipeText) 
          }}
        />
      </div>
    </div>
  );
};

export default DetailSidebar; 