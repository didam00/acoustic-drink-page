import { db } from './firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { findRecipeInComments } from './extractRecipe';

const CHANNEL_ID = 'UC1FZ59NCoUOpveg6nP6Dm-A';

export async function updateRecipes() {
  try {
    console.log('기존 영상들의 레시피 업데이트를 시작합니다...');
    
    // Firestore에서 모든 영상 데이터 가져오기
    const videosRef = collection(db, 'videos');
    const videosSnapshot = await getDocs(videosRef);
    const videos = videosSnapshot.docs.map(doc => doc.data());
    
    console.log(`총 ${videos.length}개의 영상에서 레시피를 업데이트합니다.`);
    
    let updatedCount = 0;
    let failedCount = 0;

    for (const video of videos) {
      try {
        const recipeData = await findRecipeInComments(video.id, CHANNEL_ID);
        
        if (recipeData) {
          await setDoc(doc(db, 'videos', video.id), {
            recipeText: recipeData.text,
            matchedFrom: 'comment',
            updatedAt: new Date().toISOString(),
          }, { merge: true });
          
          console.log(`레시피 업데이트 완료: ${video.id}`);
          updatedCount++;
        } else {
          console.log(`레시피를 찾을 수 없음: ${video.id}`);
        }
      } catch (e) {
        console.error(`영상 ${video.id} 업데이트 실패:`, e);
        failedCount++;
      }
    }

    console.log(`\n업데이트 완료! 성공: ${updatedCount}개, 실패: ${failedCount}개`);
    return { updatedCount, failedCount };
  } catch (error) {
    console.error('레시피 업데이트 중 오류 발생:', error);
    throw error;
  }
} 