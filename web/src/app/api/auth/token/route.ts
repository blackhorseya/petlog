import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 暫時回傳一個模擬的 token 用於開發
    // 在生產環境中，這裡應該實作真正的 Auth0 token 獲取邏輯
    const mockToken = 'development-token';
    
    return NextResponse.json({ 
      accessToken: mockToken,
      message: '這是開發環境的模擬 token'
    });
  } catch (error) {
    console.error('Token API 錯誤:', error);
    return NextResponse.json(
      { error: '無法獲取存取令牌' },
      { status: 500 }
    );
  }
}