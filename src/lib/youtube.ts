import { google, youtube_v3 } from "googleapis";
import { VideoData } from "@/types/video";
import { findRecipeInComments } from "./extractRecipe";
import { extractName } from "./extractName";

const youtube = google.youtube('v3');
const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = 'UC1FZ59NCoUOpveg6nP6Dm-A';

if (!API_KEY) {
  throw new Error('YouTube API 키가 설정되지 않았습니다.');
}

export interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnails: {
    high?: youtube_v3.Schema$Thumbnail;
    medium?: youtube_v3.Schema$Thumbnail;
    default?: youtube_v3.Schema$Thumbnail;
  };
  statistics: {
    likeCount: string;
    viewCount: string;
  };
}

export async function getRecentVideos(count: number = 5): Promise<YouTubeVideo[]> {
  const MAX_RESULTS_PER_REQUEST = 50;
  const allVideos: YouTubeVideo[] = [];
  let nextPageToken: string | undefined;

  do {
    const response = await youtube.search.list({
      key: API_KEY,
      part: ['snippet'],
      channelId: CHANNEL_ID,
      order: 'date',
      type: ['video'],
      maxResults: Math.min(MAX_RESULTS_PER_REQUEST, count - allVideos.length),
      pageToken: nextPageToken,
    });

    const videoIds = response.data.items?.map(item => item.id?.videoId).filter(Boolean) as string[];
    
    if (videoIds.length === 0) {
      break;
    }

    const videoDetails = await youtube.videos.list({
      key: API_KEY,
      part: ['snippet', 'statistics'],
      id: videoIds,
    });

    const videos = (videoDetails.data.items || []).map(video => ({
      id: video.id!,
      title: video.snippet?.title || '',
      publishedAt: video.snippet?.publishedAt || '',
      thumbnails: {
        high: video.snippet?.thumbnails?.high,
        medium: video.snippet?.thumbnails?.medium,
        default: video.snippet?.thumbnails?.default,
      },
      statistics: {
        likeCount: video.statistics?.likeCount || '0',
        viewCount: video.statistics?.viewCount || '0',
      },
    }));

    allVideos.push(...videos);
    nextPageToken = response.data.nextPageToken || undefined;

    // 요청한 개수에 도달했거나 더 이상 결과가 없으면 종료
    if (allVideos.length >= count || !nextPageToken) {
      break;
    }

    // API 할당량 관리를 위한 짧은 대기
    await new Promise(resolve => setTimeout(resolve, 100));
  } while (allVideos.length < count);

  return allVideos;
}

export async function processVideo(video: YouTubeVideo): Promise<VideoData | null> {
  // 레시피 찾기
  const recipeData = await findRecipeInComments(video.id, CHANNEL_ID);
  
  if (!recipeData) {
    return null;
  }

  // 이름 추출
  let name = '';
  const thumbnailUrl =
    video.thumbnails.high?.url ||
    video.thumbnails.medium?.url ||
    video.thumbnails.default?.url ||
    '';
  if (thumbnailUrl) {
    name = await extractName(thumbnailUrl);
  }

  return {
    id: video.id,
    title: video.title,
    name,
    recipeText: recipeData.text,
    matchedFrom: 'comment',
    publishedAt: new Date(video.publishedAt),
    like: parseInt(video.statistics.likeCount),
    view: parseInt(video.statistics.viewCount),
    thumbnail: video.thumbnails.high?.url || video.thumbnails.medium?.url || video.thumbnails.default?.url || '',
    glass: 'any',
    ingredients: [],
  };
}
