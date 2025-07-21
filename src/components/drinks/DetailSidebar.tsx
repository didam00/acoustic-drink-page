import { useState, useEffect, useRef } from 'react';
import { VideoData } from '@/types/video';
import { highlightIngredients } from '@/lib/ingredients';
import { updateRecipeText } from '@/lib/recipes';

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
  const recipeRef = useRef<HTMLDivElement>(null);
  const isDev = process.env.NODE_ENV === 'development';
  const [editMode, setEditMode] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState(currentVideo.recipeText);
  const [originalRecipe, setOriginalRecipe] = useState(currentVideo.recipeText);
  const [editedName, setEditedName] = useState(currentVideo.name);
  const [originalName, setOriginalName] = useState(currentVideo.name);

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
      setEditedRecipe(selectedVideo.recipeText);
      setOriginalRecipe(selectedVideo.recipeText);
      setEditedName(selectedVideo.name);
      setOriginalName(selectedVideo.name);
      setEditMode(false);
    }
  }, [selectedVideo]);

  useEffect(() => {
    if (!editMode && recipeRef.current) {
      highlightIngredients(currentVideo.recipeText).then(result => {
        recipeRef.current!.innerHTML = result;
      });
    }
  }, [currentVideo.recipeText, editMode]);

  const handleEdit = () => {
    setEditMode(true);
    setEditedRecipe(currentVideo.recipeText);
    setOriginalRecipe(currentVideo.recipeText);
    setEditedName(currentVideo.name);
    setOriginalName(currentVideo.name);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedRecipe(originalRecipe);
    setEditedName(originalName);
  };

  const handleSave = async () => {
    await updateRecipeText(currentVideo.id, editedRecipe, editedName);
    setCurrentVideo({ ...currentVideo, recipeText: editedRecipe, name: editedName });
    setEditMode(false);
  };

  return (
    <div
      className={`detail-sidebar ${isClosing ? 'custom-slide-out-right' : 'custom-slide-in-right'}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="flex justify-between items-center">
        {isDev && editMode ? (
          <input
            type="text"
            value={editedName}
            onChange={e => setEditedName(e.target.value)}
            className="block text-[--p] bg-[--bg-1] w-full text-lg mb-2"
          />
        ) : (
          <h2 className="block text-[--p]">{currentVideo.name}</h2>
        )}
        <button onClick={onClose} className="text-xl font-black transition-colors text-[--fg-0] hover:text-white mr-1 hidden md:block">
          <span className="material-icons">close</span>
        </button>
      </div>
      {isDev && !editMode && (
          <button
            className="mb-4 px-3 py-1.5 rounded bg-[--bg-2] text-white text-sm hover:bg-[--fg-0] transition-colors"
            onClick={handleEdit}
          >
            수정
          </button>
      )}
      {isDev && editMode && (
        <div className="flex gap-2 mb-4">
          <button
            className="px-3 py-1.5 rounded bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors"
            onClick={handleSave}
          >
            완료
          </button>
          <button
            className="px-3 py-1.5 rounded bg-gray-400 text-white text-sm font-bold hover:bg-gray-500 transition-colors"
            onClick={handleCancel}
            >
            취소
          </button>
        </div>
      )}
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
        {isDev && editMode ? (
          <div>
            <textarea
              value={editedRecipe}
              onChange={e => setEditedRecipe(e.target.value)}
              className="w-full h-80 mt-4 p-4 bg-[--bg-1] rounded"
            />
            <div className="flex gap-2">
              <button
                className="px-3 py-1.5 rounded bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors"
                onClick={handleSave}
              >
                완료
              </button>
              <button
                className="px-3 py-1.5 rounded bg-gray-400 text-white text-sm font-bold hover:bg-gray-500 transition-colors"
                onClick={handleCancel}
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div 
            ref={recipeRef}
            className="whitespace-pre-wrap leading-2 select-text"
          />
        )}
      </div>
    </div>
  );
};

export default DetailSidebar; 