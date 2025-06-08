import { NextRequest, NextResponse } from 'next/server';
import { refreshDatabase } from '@/lib/refreshDatabase';

export async function GET(request: NextRequest) {
  try {
    // 토큰 검증
    const token = request.nextUrl.searchParams.get('token');
    const count = request.nextUrl.searchParams.get('count');
    const secret = process.env.CRON_SECRET;

    if (!secret) {
      console.error('CRON_SECRET이 설정되지 않았습니다.');
      return NextResponse.json(
        { error: '서버 설정 오류' },
        { status: 500 }
      );
    }

    if (!token || token !== secret) {
      console.error('잘못된 토큰으로 접근 시도');
      return NextResponse.json(
        { error: '인증 실패' },
        { status: 401 }
      );
    }

    // 데이터베이스 새로고침 실행
    await refreshDatabase(count ? parseInt(count) : 5);

    return NextResponse.json({ 
      success: true,
      message: '데이터베이스 새로고침이 완료되었습니다.'
    });

  } catch (error) {
    console.error('데이터베이스 새로고침 중 오류 발생:', error);
    return NextResponse.json(
      { 
        error: '데이터베이스 새로고침 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
} 