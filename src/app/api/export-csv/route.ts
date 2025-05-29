import { NextRequest } from 'next/server';
import { exportVideosToCSV } from '@/lib/exportToCsv';

export async function GET(req: NextRequest) {
  try {
    const { csvContent, filename } = await exportVideosToCSV();
    
    // CSV 파일 다운로드를 위한 응답 헤더 설정
    const headers = new Headers();
    headers.set('Content-Type', 'text/csv; charset=utf-8');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    
    return new Response(csvContent, {
      status: 200,
      headers,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 