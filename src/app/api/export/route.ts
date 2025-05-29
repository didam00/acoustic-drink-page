import { NextResponse } from 'next/server';
import { exportVideosToCSV } from '@/lib/exportToCsv';
import { exportVideosToJSON } from '@/lib/exportToJson';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format')?.toLowerCase();

    if (!format || (format !== 'csv' && format !== 'json')) {
      return NextResponse.json(
        { error: '잘못된 형식입니다. format 파라미터는 "csv" 또는 "json"이어야 합니다.' },
        { status: 400 }
      );
    }

    let content: string;
    let filename: string;
    let contentType: string;

    if (format === 'csv') {
      const result = await exportVideosToCSV();
      content = result.csvContent;
      filename = result.filename;
      contentType = 'text/csv; charset=utf-8';
    } else {
      const result = await exportVideosToJSON();
      content = result.jsonContent;
      filename = result.filename;
      contentType = 'application/json; charset=utf-8';
    }

    // 응답 헤더 설정
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    return new NextResponse(content, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('내보내기 중 오류 발생:', error);
    return NextResponse.json(
      { error: '내보내기 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 