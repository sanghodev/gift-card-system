import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GiftCertificate from '@/models/GiftCertificate'; // 실제 모델 가져오기

export async function GET(request: Request) {
  await dbConnect(); // MongoDB 연결

  // URL 쿼리 파라미터 가져오기
  const { search, amount, isUsed, from, to, limit = '50', page = '1' } = Object.fromEntries(new URL(request.url).searchParams);

  // 쿼리 객체 생성
  const query: any = {};

  if (amount) query.amount = Number(amount); // amount를 숫자로 변환하여 쿼리
  if (isUsed !== undefined) query.isUsed = isUsed === 'true'; // true/false 필터링
  if (search) query.voucherNo = { $regex: search, $options: 'i' }; // 바우처 번호 검색

  // 날짜 필터링
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }

  // 페이지네이션 설정
  const limitNum = parseInt(limit, 10);
  const skip = (parseInt(page, 10) - 1) * limitNum;

  try {
    // 전체 문서 수 조회
    const total = await GiftCertificate.countDocuments(query);

    // 바우처 목록 조회
    const vouchers = await GiftCertificate.find(query)
      .limit(limitNum) // 요청된 개수만큼 가져오기
      .skip(skip) // 페이지네이션 적용
      .sort({ createdAt: -1 }); // 최신 순으로 정렬

    // 결과 반환
    return NextResponse.json({
      vouchers, // 바우처 리스트
      total, // 전체 바우처 수
      page: parseInt(page, 10), // 현재 페이지
      limit: limitNum, // 페이지당 문서 수
    });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    return NextResponse.json({ error: 'Failed to retrieve vouchers' }, { status: 500 });
  }
}
