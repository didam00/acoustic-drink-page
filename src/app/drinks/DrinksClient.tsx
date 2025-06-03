'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import CocktailCard from '@/components/drinks/CocktailCard';
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, startAfter, DocumentSnapshot, where } from "firebase/firestore";
import { VideoData } from '@/types/video';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import FilterSidebar from '@/components/drinks/FilterSidebar';
import DetailSidebar from '@/components/drinks/DetailSidebar';
import BottomSheet from '@/components/common/BottomSheet';
import ingredientsTreeData from '../../../public/json/ingredients_tree.json';
import { IngredientsTree } from '@/components/drinks/types';

type SortType = 'latest' | 'alpha' | 'views' | 'likes';
type SortDirection = 'asc' | 'desc';

interface SortOption {
  type: SortType;
  label: string;
  direction: SortDirection;
}

const ITEMS_PER_PAGE = 20;

export default function DrinksClient() {
  const [allVideos, setAllVideos] = useState<VideoData[]>([]);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver>(null);
  const loadingRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchMoreData();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);
  const [search, setSearch] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>({
    type: 'latest',
    label: '최신순',
    direction: 'asc'
  });
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // URL 파라미터 업데이트 함수
  const updateSearchParams = useCallback((id: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set('id', id);
    } else {
      params.delete('id');
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  // 모든 영상 한 번에 받아오기
  useEffect(() => {
    (async () => {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "videos"));
      const all = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as VideoData[];
      setAllVideos(all);
      setLoading(false);
    })();
  }, []);

  // 모든 재료 목록 추출
  const allIngredients = React.useMemo(() => {
    const ingredients = new Set<string>();
    allVideos.forEach(video => {
      if (video.ingredients) {
        video.ingredients.forEach(ing => ingredients.add(ing));
      }
    });
    return Array.from(ingredients).sort();
  }, [allVideos]);

  // 검색/정렬된 전체 목록
  const filteredSorted = React.useMemo(() => {
    let arr = allVideos;
    
    // 재료 필터링. 이 재료들로 만들 수 있음
    if (selectedIngredients.length > 0) {
      arr = arr.filter(v => {
        if (!v.ingredients || v.ingredients.length === 0) return false;
        return selectedIngredients.every(ing => v.ingredients?.includes(ing));
      });
    }

    // 검색어 필터링
    if (search) {
      const searchTerm = search.replace(/\s/g, '').toLowerCase();
      arr = arr.filter(v => {
        const name = (v.name || '').replace(/\s/g, '').toLowerCase();
        const title = (v.title || '').replace(/\s/g, '').toLowerCase();
        const recipe = (v.recipeText || '').replace(/\s/g, '').toLowerCase();
        return name.includes(searchTerm) || 
               title.includes(searchTerm) || 
               recipe.includes(searchTerm);
      });
    }
    
    arr = arr.slice().sort((a, b) => {
      const multiplier = sort.direction === 'asc' ? 1 : -1;
      switch (sort.type) {
        case 'alpha':
          const an = a.name || '';
          const bn = b.name || '';
          return multiplier * an.localeCompare(bn, 'ko', { sensitivity: 'base', ignorePunctuation: true });
        case 'views':
          return multiplier * ((a.view || 0) - (b.view || 0));
        case 'likes':
          return multiplier * ((a.like || 0) - (b.like || 0));
        case 'latest':
        default:
          const dateA = new Date(a.publishedAt || 0).getTime();
          const dateB = new Date(b.publishedAt || 0).getTime();
          return multiplier * (dateB - dateA);
      }
    });
    return arr;
  }, [allVideos, search, sort, selectedIngredients]);

  // lazy loading (프론트에서 페이징)
  const fetchMoreData = () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setTimeout(() => {
      setVideos(prev => {
        const ids = new Set(prev.map(v => v.id));
        const next = filteredSorted.slice(prev.length, prev.length + ITEMS_PER_PAGE);
        const uniqueNew = next.filter(v => !ids.has(v.id));
        if (prev.length + uniqueNew.length >= filteredSorted.length) setHasMore(false);
        return [...prev, ...uniqueNew];
      });
      setLoading(false);
    }, 200);
  };

  // 검색/정렬 바뀌면 목록 리셋
  useEffect(() => {
    setVideos(filteredSorted.slice(0, ITEMS_PER_PAGE));
    setHasMore(filteredSorted.length > ITEMS_PER_PAGE);
  }, [filteredSorted]);

  // 카드 클릭 시 상세보기로 전환 + URL 변경
  const handleCardClick = useCallback((video: VideoData) => {
    setSelectedVideo(video);
    updateSearchParams(video.id);
    setIsDetailOpen(true);

    // 사이드바 스크롤 맨 위로 이동
    if (sidebarRef.current) {
      sidebarRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

  }, [updateSearchParams]);

  // 상세보기 닫기
  const handleClose = useCallback(() => {
    setSelectedVideo(null);
    updateSearchParams(null);
    setIsDetailOpen(false);
  }, [updateSearchParams]);

  const onIngredientsChange = (ingredients: string[], categories: string[]) => {
    setSelectedIngredients(ingredients);
    setSelectedCategories(categories);
  };

  // state 변경 감지를 위한 useEffect
  useEffect(() => {
  }, [selectedIngredients, selectedCategories]);

  // 공유 버튼 클릭 시 링크 복사
  const handleShare = () => {
    if (!selectedVideo) return;
    const url = `${window.location.origin}/drinks?id=${selectedVideo.id}`;
    navigator.clipboard.writeText(url);
    alert('링크가 복사되었습니다!');
  };

  // URL에 id 쿼리 있을 때 자동 상세보기
  useEffect(() => {
    const id = searchParams.get('id');
    if (id && videos.length > 0) {
      const found = videos.find(v => v.id === id);
      if (found) {
        setSelectedVideo(found);
        setIsDetailOpen(true);
      }
    }
  }, [searchParams, videos]);

  return (
    <main className="min-h-[calc(100vh-64px)] px-0 md:px-12">
      {/* 모바일 필터 버튼 */}
      <button
        onClick={() => {
          setIsFilterOpen(true);
          if (sidebarRef.current) {
            sidebarRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        className="md:hidden fixed bottom-4 right-4 bg-[--bg-0] text-[--fg-1] border-[1px] border-solid border-[--fg-0] px-5 py-2 rounded-lg z-30 flex items-center gap-2 fg-glow-2"
      >
        <span className="material-icons ml-[-4px]">filter_alt</span>
        필터
      </button>

      <div className="split-tabs flex">
        <section className="flex-1 overflow-y-auto overflow-x-visible h-[calc(100vh-64px)] px-0 md:pr-8 md:pl-20 md:ml-[-80px] touch-pan-y">
          <h1 className="md:ml-4">칵테일 목록</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 p-4 transition-all duration-300">
            {videos.length > 0 ? (
              videos.map((video) => (
                <div key={`${video.id}-${search}-${sort.type}-${sort.direction}`} className="w-full aspect-[3/4]">
                  <CocktailCard 
                    video={video} 
                    focus={selectedVideo?.id === video.id}
                    onClick={() => handleCardClick(video)}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-[--fg-0] animate-fade-in">
                <span className="material-icons text-6xl mb-4">search_off</span>
                <p className="text-lg">찾으시는 칵테일이 없어요</p>
                <p className="text-sm mt-2">다른 재료나 검색어로 다시 찾아보세요</p>
              </div>
            )}
          </div>
          <div ref={loadingRef} className="h-10 flex items-center justify-center">
            {loading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>}
          </div>
        </section>

        {/* PC 사이드바 */}
        <section className="hidden md:block w-[432px] px-8 h-[calc(100vh-64px)] sticky top-5 overflow-y-scroll pt-12 overflow-x-visible" ref={sidebarRef}>
          {selectedVideo ? (
            <DetailSidebar
              selectedVideo={selectedVideo}
              onClose={handleClose}
              onShare={handleShare}
            />
          ) : (
            <FilterSidebar
              search={search}
              setSearch={setSearch}
              sort={sort}
              onSortChange={setSort}
              allIngredients={allIngredients}
              selectedIngredients={selectedIngredients}
              onIngredientsChange={onIngredientsChange}
              selectedCategories={selectedCategories}
            />
          )}
          <div className="h-8"></div>
        </section>

        {/* 모바일 바텀 시트 - 필터 */}
        <BottomSheet
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        >
          <FilterSidebar
            search={search}
            setSearch={setSearch}
            sort={sort}
            onSortChange={(newSort) => {
              setSort(newSort);
              setIsFilterOpen(false);
            }}
            allIngredients={allIngredients}
            selectedIngredients={selectedIngredients}
            onIngredientsChange={onIngredientsChange}
            selectedCategories={selectedCategories}
          />
        </BottomSheet>

        {/* 모바일 바텀 시트 - 상세보기 */}
        <BottomSheet
          isOpen={isDetailOpen}
          onClose={handleClose}
          title="칵테일 정보"
        >
          {selectedVideo && (
            <DetailSidebar
              selectedVideo={selectedVideo}
              onClose={handleClose}
              onShare={handleShare}
            />
          )}
        </BottomSheet>
      </div>
    </main>
  )
} 