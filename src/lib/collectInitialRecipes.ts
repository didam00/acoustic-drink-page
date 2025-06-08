// 최초 수집

import { google } from 'googleapis';
import { VideoData } from '@/types/video';
import { findRecipeInComments } from './extractRecipe';
import { extractName } from './extractName';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { detectGlassType } from "./glassDetector";
import { extractIngredients } from "./ingredientExtractor";

const youtube = google.youtube('v3');
const API_KEY = process.env.YOUTUBE_API_KEY;
const MAX_RESULTS_PER_PAGE = 10; // YouTube API의 최대값
const CHANNEL_ID = 'UC1FZ59NCoUOpveg6nP6Dm-A';

export async function collectInitialRecipes() {
  if (!API_KEY) {
    throw new Error('YouTube API 키가 설정되지 않았습니다.');
  }

  try {
    // 채널의 모든 영상 가져오기
    const videos: VideoData[] = [];
    let nextPageToken: string | undefined;
    let pageCount = 0;
    let totalVideos = 0;
    let recipesFound = 0;

    console.log('영상 수집을 시작합니다...');

    do {
      pageCount++;
      console.log(`\n[${pageCount}페이지] 영상 목록 가져오는 중...`);
      
      const response = await youtube.search.list({
        key: API_KEY,
        part: ['snippet'],
        channelId: CHANNEL_ID,
        order: 'date',
        type: ['video'],
        maxResults: 50,
        pageToken: nextPageToken,
      });

      // 각 영상의 상세 정보 가져오기
      const videoIds = response.data.items?.map(item => item.id?.videoId).filter(Boolean) as string[];
      
      if (videoIds.length > 0) {
        console.log(`${videoIds.length}개의 영상 상세 정보 가져오는 중...`);
        
        const videoDetails = await youtube.videos.list({
          key: API_KEY,
          part: ['snippet', 'statistics'],
          id: videoIds,
        });

        // 각 영상의 레시피 찾기 및 썸네일에서 이름 추출
        for (const video of videoDetails.data.items || []) {
          const recipeData = await findRecipeInComments(video.id!, CHANNEL_ID);

          if (recipeData) {
            let name = '';
            if (video.snippet?.thumbnails) {
              const thumbnailUrl =
                video.snippet?.thumbnails?.maxres?.url ||
                video.snippet?.thumbnails?.standard?.url ||
                video.snippet?.thumbnails?.high?.url ||
                video.snippet?.thumbnails?.medium?.url ||
                video.snippet?.thumbnails?.default?.url ||
                '';
              if (thumbnailUrl) {
                name = await extractName(thumbnailUrl);
              }
            }

            const videoData: VideoData = {
              id: video.id!,
              title: video.snippet?.title || '',
              name,
              recipeText: recipeData.text,
              matchedFrom: 'comment',
              publishedAt: new Date(video.snippet?.publishedAt || ''),
              thumbnail: video.snippet?.thumbnails?.high?.url || '',
              like: parseInt(video.statistics?.likeCount || '0'),
              view: parseInt(video.statistics?.viewCount || '0'),
              glass: detectGlassType(recipeData.text),
              ingredients: extractIngredients(recipeData.text),
            };

            videos.push(videoData);

            // Firestore에 저장
            try {
              await setDoc(doc(db, 'videos', videoData.id), {
                ...videoData,
                publishedAt: videoData.publishedAt.toISOString(), // Firestore에 ISO 문자열로 저장
              });
              console.log(`Firestore에 저장 완료: ${videoData.id}`);
            } catch (e) {
              console.error(`Firestore 저장 실패: ${videoData.id}`, e);
            }
          }
        }

        totalVideos += videoDetails.data.items?.length || 0;
        console.log(`현재까지 ${totalVideos}개의 영상 정보를 수집했습니다. (레시피 ${recipesFound}개)`);
      }

      nextPageToken = response.data.nextPageToken || undefined;
    } while (nextPageToken);

    console.log(`\n수집 완료! 총 ${videos.length}개의 영상 정보를 가져왔습니다. (레시피 ${recipesFound}개)`);
    return videos;
  } catch (error) {
    console.error('영상 목록을 가져오는 중 오류 발생:', error);
    throw error;
  }
}
