import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export async function exportVideosToJSON() {
  try {
    // Firestore에서 모든 영상 데이터 가져오기
    const videosRef = collection(db, 'videos');
    const videosSnapshot = await getDocs(videosRef);
    const videos = videosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // JSON 문자열 생성 (들여쓰기 적용)
    const jsonContent = JSON.stringify(videos, null, 2);
    
    // 현재 날짜를 파일명에 포함
    const date = new Date().toISOString().split('T')[0];
    const filename = `acoustic-drinks-${date}.json`;

    return {
      jsonContent,
      filename
    };
  } catch (error) {
    console.error('JSON 변환 중 오류 발생:', error);
    throw error;
  }
} 