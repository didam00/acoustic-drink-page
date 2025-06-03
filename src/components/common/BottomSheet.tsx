import React, { useEffect, useRef, useState } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  const [isClosing, setIsClosing] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout>(null);

  // 바텀시트가 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    animationTimeoutRef.current = setTimeout(() => {
      onClose();
    }, 300); // 애니메이션 duration과 동일하게
  };

  // 드래그로 닫기 관련 상태
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const lastY = useRef<number | null>(null);
  const dragging = useRef<boolean>(false);
  const MAX_DRAG = 200; // 최대 드래그 거리(px)

  // 터치 이벤트 핸들러
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    if (!isOpen) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      // 컨텐츠 스크롤이 맨 위일 때만 드래그 시작
      console.log(sheetRef.current?.scrollTop);
      if (sheetRef.current && sheetRef.current.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        lastY.current = e.touches[0].clientY;
        dragging.current = true;
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!dragging.current || startY.current === null) return;
      const currentY = e.touches[0].clientY;
      let diff = currentY - startY.current;
      if (diff < 0) diff = 0; // 위로는 못 올림
      if (diff > MAX_DRAG) diff = MAX_DRAG; // 최대치 제한
      lastY.current = currentY;
      // sheet을 아래로 이동
      if (sheet) {
        sheet.style.transform = `translateY(${diff}px)`;
      }
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (!dragging.current || startY.current === null || lastY.current === null) return;
      let diff = lastY.current - startY.current;
      if (diff > MAX_DRAG) diff = MAX_DRAG;
      // 60px 이상 아래로 드래그하면 닫기
      if (diff > 60) {
        if (sheetRef.current) sheetRef.current.style.transform = '';
        handleClose();
      } else {
        // 원위치로 애니메이션 (최대치에서 시작)
        if (sheetRef.current) sheetRef.current.style.transform = '';
      }
      dragging.current = false;
      startY.current = null;
      lastY.current = null;
    };
    sheet.addEventListener('touchstart', handleTouchStart);
    sheet.addEventListener('touchmove', handleTouchMove);
    sheet.addEventListener('touchend', handleTouchEnd);
    return () => {
      sheet.removeEventListener('touchstart', handleTouchStart);
      sheet.removeEventListener('touchmove', handleTouchMove);
      sheet.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden
          ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}
          ${isOpen ? 'block' : 'hidden'}`
        }
      />
      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 bg-[--bg-0] rounded-t-3xl z-50 md:hidden max-h-[85vh] overflow-y-auto overscroll-contain
          ${isClosing ? 'animate-slide-down' : 'animate-slide-up'}`}
        style={{ touchAction: 'pan-y' }}
      >
        {/* Handle */}
        <div className="w-16 h-1 bg-gray-700 rounded-full mx-auto mt-3 mb-4" />
        
        {/* Header */}
        {title && (
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between">
              <h2>{title}</h2>
              {/* X 버튼은 PC에서만 보이게 (md 이상) */}
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors hidden md:block"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="px-6 py-4">
          {children}
        </div>

        {/* Safe Area Spacer */}
        <div className="h-8" />
      </div>
    </>
  );
} 