import React, { useState, useRef } from 'react'
import { VideoData } from '@/types/video';
import Image from 'next/image';
import { formatNumber } from '@/lib/formatNumber';

interface CocktailCardProps {
  video: VideoData;
  focus: boolean;
  onClick: () => void;
}

const CocktailCard = React.memo(({video, focus, onClick}: CocktailCardProps) => {
  const [imgSrc, setImgSrc] = useState('/images/thumnail_error.jpg');

  const handleImageLoad = () => {
    if (imgSrc === '/images/thumnail_error.jpg') {
      setImgSrc(video.thumbnail.replace('hqdefault', 'oardefault'));
    }
  };

  const handleImageError = () => {
    setImgSrc('/images/thumnail_error.jpg');
  };

  return (
    <div 
      className={`card-container relative overflow-visible cursor-pointer rounded-lg transition-all animate-fade-in w-full ${focus ? "focus" : ""}`}
      onClick={onClick}
    >
      <div className="img-wrap relative w-full aspect-[2/3] overflow-hidden rounded-lg fg-glow-0">
        <Image
          src={imgSrc}
          alt={video.title}
          fill
          className="object-cover transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, 33vw"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
      <div className="mt-2">
        <span className="name">{video.name}</span>
        <div className="flex gap-4 font-detail">
          <span className="flex items-center gap-1">
            <span className="text-sm material-icons">visibility</span>
            <span>{formatNumber(video.view)}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-sm material-icons">thumb_up</span>
            <span>{Math.round((video.like / video.view) * 1000) / 10}%</span>
          </span>
        </div>
      </div>
    </div>
  );
});

CocktailCard.displayName = 'CocktailCard';

export default CocktailCard;