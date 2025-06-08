import { google } from 'googleapis';

const youtube = google.youtube('v3');
const API_KEY = process.env.YOUTUBE_API_KEY;

interface CommentData {
  text: string;
  authorChannelId: string;
}

export function extractRecipeFromText(text: string): string | null {
  // '레시피' 다음에 오는 모든 내용을 가져옴
  const match = text.match(/레시피(?:<br>|\s*[\n\r])+([\s\S]*)/i);
  if (!match) return null;
  
  const recipe = match[1]
    .replace(/<br>/g, '\n') // <br> 태그를 줄바꿈으로 변환
    .replace(/\n{3,}/g, '\n\n') // 3개 이상 연속된 줄바꿈을 2개로 통일
    .trim();
  
  // 레시피가 너무 짧으면 무시
  if (recipe.length < 10) return null;
  
  return recipe;
}

export async function findRecipeInComments(videoId: string, channelId: string): Promise<CommentData | null> {
  if (!API_KEY) {
    throw new Error('YouTube API 키가 설정되지 않았습니다.');
  }

  try {
    // 댓글 가져오기 (최대 100개)
    const response = await youtube.commentThreads.list({
      key: API_KEY,
      part: ['snippet'],
      videoId: videoId,
      maxResults: 100,
      order: 'relevance', // 관련성 순으로 정렬
    });

    const comments = response.data.items || [];
    
    // 채널 주인의 댓글 중 레시피가 포함된 댓글 찾기
    for (const comment of comments) {
      const snippet = comment.snippet?.topLevelComment?.snippet;
      if (!snippet) continue;
      
      // 채널 주인의 댓글인지 확인
      if (snippet.authorChannelId?.value !== channelId) continue;
      
      const text = snippet.textDisplay?.replaceAll("\r", "");
      
      // 레시피가 포함된 댓글인지 확인
      if (
        text?.toLowerCase().replaceAll(" ", "").includes('레시피<br>') ||
        text?.toLowerCase().replaceAll(" ", "").includes('레시피\n')
      ) {
        const recipe = extractRecipeFromText(text);
        if (recipe) {
          return {
            text: recipe,
            authorChannelId: snippet.authorChannelId.value,
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error(`영상 ${videoId}의 댓글을 가져오는 중 오류 발생:`, error);
    return null;
  }
} 