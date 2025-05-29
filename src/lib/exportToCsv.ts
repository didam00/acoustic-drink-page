import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

function convertToCSV(data: any[]) {
  if (data.length === 0) return '';

  // CSV 헤더 생성
  const headers = Object.keys(data[0]);
  const headerRow = headers.join(',');

  // 데이터 행 생성
  const rows = data.map(item => {
    return headers.map(header => {
      const value = item[header];
      // 값이 문자열이고 쉼표를 포함하는 경우 따옴표로 감싸기
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      // null이나 undefined는 빈 문자열로
      if (value == null) return '';
      // 날짜 객체는 ISO 문자열로
      if (value instanceof Date) return value.toISOString();
      // 객체나 배열은 JSON 문자열로
      if (typeof value === 'object') return JSON.stringify(value);
      return value;
    }).join(',');
  });

  return [headerRow, ...rows].join('\n');
}

export async function exportVideosToCSV() {
  try {
    // Firestore에서 모든 영상 데이터 가져오기
    const videosRef = collection(db, 'videos');
    const videosSnapshot = await getDocs(videosRef);
    const videos = videosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // CSV 문자열 생성
    const csvContent = convertToCSV(videos);
    
    // UTF-8 BOM 추가
    const BOM = '\uFEFF';
    const csvContentWithBOM = BOM + csvContent;
    
    // 현재 날짜를 파일명에 포함
    const date = new Date().toISOString().split('T')[0];
    const filename = `acoustic-drinks-${date}.csv`;

    return {
      csvContent: csvContentWithBOM,
      filename
    };
  } catch (error) {
    console.error('CSV 변환 중 오류 발생:', error);
    throw error;
  }
} 