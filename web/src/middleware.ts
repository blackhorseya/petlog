import { NextRequest, NextResponse } from 'next/server';

// 移除強制登入要求，允許未登入用戶瀏覽所有頁面
// 實際的認證檢查由各頁面元件和後端 API 處理
// 保留此 middleware 以便未來需要時可以快速新增中介邏輯
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 