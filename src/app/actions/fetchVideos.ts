'use server';

import axios from "axios";
import { VideoData } from "@/types/video";
import { extractName } from "@/lib/extractName";
import { detectGlassType } from "@/lib/glassDetector";
import { extractIngredients } from "@/lib/ingredientExtractor";

const API_KEY = process.env.YOUTUBE_API_KEY!;
const CHANNEL_ID = "UC1FZ59NCoUOpveg6nP6Dm-A";

function extractRecipe(text: string): string | null {
  const match = text.match(/레시피(?:<br>|\s*[\n\r])+([\s\S]*?)(?=<br><br>|$)/i);
  if (!match) return null;
  
  const recipe = match[1]
    .replace(/<br>/g, '\n')
    .trim();
  
  if (recipe.length < 10) return null;
  
  return recipe;
}

interface VideoStats {
  like: number;
  view: number;
}

interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: Date;
}

export async function fetchVideos(): Promise<VideoData[]> {
  console.log('fetchVideos 시작');
  const youtube = axios.create({
    baseURL: "https://www.googleapis.com/youtube/v3",
    headers: { "Content-Type": "application/json" },
  });

  try {
    // 1. 비디오 검색 시 statistics도 함께 가져오기
    console.log('검색 API 호출 시작');
    const searchRes = await youtube.get("/search", {
      params: {
        key: API_KEY,
        channelId: CHANNEL_ID,
        part: "snippet",
        order: "date",
        maxResults: 10,
        type: "video",
      },
    });
    console.log('검색 결과:', searchRes.data);

    const videos: VideoInfo[] = searchRes.data.items
      .filter((item: any) => item.id.kind === "youtube#video")
      .map((item: any) => {
        const thumbs = item.snippet.thumbnails;
        const thumbnail =
          thumbs.maxres?.url ||
          thumbs.standard?.url ||
          thumbs.high?.url ||
          thumbs.medium?.url ||
          thumbs.default?.url;
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail,
          publishedAt: new Date(item.snippet.publishedAt),
        };
      });

    // 2. 비디오 ID 목록을 한 번에 가져오기
    if (videos.length === 0) return [];
    
    const videoIds = videos.map(v => v.id).join(',');
    const statsRes = await youtube.get("/videos", {
      params: {
        key: API_KEY,
        id: videoIds,
        part: "statistics",
      },
    });
    
    // 3. 통계 정보를 맵으로 변환
    const statsMap = new Map<string, VideoStats>(
      statsRes.data.items.map((item: any) => [
        item.id,
        {
          like: Number(item.statistics.likeCount || 0),
          view: Number(item.statistics.viewCount || 0),
        }
      ])
    );

    const result: VideoData[] = [];

    // 4. 각 비디오의 댓글만 가져오기
    for (const v of videos) {
      console.log(`비디오 ${v.id} 처리 중...`);
      try {
        const stats = statsMap.get(v.id) || { like: 0, view: 0 } as VideoStats;
        const commentRes = await youtube.get("/commentThreads", {
          params: {
            key: API_KEY,
            videoId: v.id,
            part: "snippet",
            maxResults: 20,
            order: "relevance",
          },
        });

        const commentItems = commentRes.data.items || [];
        const matched = commentItems.find((c: any) => {
          const s = c.snippet.topLevelComment.snippet;
          return s.authorChannelId?.value === CHANNEL_ID && 
            (s.textDisplay.toLowerCase().includes('레시피<br>') || 
             s.textDisplay.toLowerCase().includes('레시피'));
        });

        if (!matched) {
          console.log(`비디오 ${v.id}: 레시피 댓글 없음`);
          continue;
        }

        const recipeText = extractRecipe(matched.snippet.topLevelComment.snippet.textDisplay);
        if (!recipeText) {
          console.log(`비디오 ${v.id}: 레시피 텍스트 추출 실패 - 원본:`, matched.snippet.topLevelComment.snippet.textDisplay);
          continue;
        }

        const name = await extractName(v.thumbnail);

        result.push({
          id: v.id,
          title: v.title,
          name,
          recipeText,
          matchedFrom: "comment",
          publishedAt: v.publishedAt,
          thumbnail: v.thumbnail,
          like: stats.like,
          view: stats.view,
          glass: detectGlassType(recipeText),
          ingredients: extractIngredients(recipeText),
        });
        console.log(`비디오 ${v.id} 처리 완료`);
      } catch (error) {
        console.error(`비디오 ${v.id} 처리 중 에러:`, error);
      }
    }

    console.log('최종 결과:', result);
    return result;
  } catch (error) {
    console.error('fetchVideos 에러:', error);
    throw error;
  }
}
