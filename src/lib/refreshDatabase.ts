/**
 * Refresh the database
 * 
 * 1시간마다 최근 올라온 N개의 영상들을 확인하여 올라오지 않은 영상들을 분석하여 db에 저장
 * N은 기본으로 5로 지정
 */

import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getRecentVideos, processVideo } from "./youtube";
import { detectGlassType } from "./glassDetector";
import { extractIngredients } from "./ingredientExtractor";

export const refreshDatabase = async (searchCount: number = 5) => {
  try {
    console.log('최근 영상 확인을 시작합니다...');

    // 최근 영상 목록 가져오기
    const videos = await getRecentVideos(searchCount);
    
    if (videos.length === 0) {
      console.log('새로운 영상을 찾을 수 없습니다.');
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;

    // 각 영상 처리
    for (const video of videos) {
      // 이미 DB에 있는지 확인
      const docRef = doc(db, 'videos', video.id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log(`영상 ${video.id}는 이미 DB에 있습니다.`);
        skippedCount++;
        continue;
      }

      // 영상 정보 처리
      const videoData = await processVideo(video);
      
      if (!videoData) {
        console.log(`영상 ${video.id}에서 레시피를 찾을 수 없습니다.`);
        skippedCount++;
        continue;
      }

      // 잔 타입과 재료 정보 추가
      videoData.glass = detectGlassType(videoData.recipeText);
      videoData.ingredients = extractIngredients(videoData.recipeText);

      // Firestore에 저장
      try {
        await setDoc(docRef, {
          ...videoData,
          publishedAt: videoData.publishedAt.toISOString(),
        });
        console.log(`새 영상 저장 완료: ${video.id} (${videoData.name})`);
        updatedCount++;
      } catch (e) {
        console.error(`Firestore 저장 실패: ${video.id}`, e);
      }
    }

    console.log(`\n처리 완료:`);
    console.log(`- 새로 저장된 영상: ${updatedCount}개`);
    console.log(`- 건너뛴 영상: ${skippedCount}개`);

  } catch (error) {
    console.error('데이터베이스 새로고침 중 오류 발생:', error);
    throw error;
  }
};