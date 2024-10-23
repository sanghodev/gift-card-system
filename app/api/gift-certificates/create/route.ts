// app/api/gift-certificates/create/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GiftCertificate from '@/models/GiftCertificate';

export async function POST(request: Request) {
  await dbConnect();

  const { amount, note } = await request.json(); // 노트 필드 추가

  // 유효한 금액인지 확인
  if (![30, 50, 75].includes(amount)) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  // Voucher 넘버 생성 규칙
  const generateVoucherNo = () => {
    const prefix = amount === 30 ? 'A' : amount === 50 ? 'C' : 'E';
    const randomNumber = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 숫자 생성
    return `${prefix}${randomNumber}`; // 7자리로 조합
  };

  let voucherNo = generateVoucherNo();
  let isDuplicate = true;

  // 중복된 Voucher 번호가 없을 때까지 재시도
  while (isDuplicate) {
    const existingVoucher = await GiftCertificate.findOne({ voucherNo });
    if (!existingVoucher) {
      isDuplicate = false; // 중복된 번호가 없으면 루프 종료
    } else {
      voucherNo = generateVoucherNo(); // 중복된 번호가 있으면 다시 생성
    }
  }

  // 만료일 1년 후로 설정
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 1);

  // 새로운 기프트카드 생성
  const newGiftCard = new GiftCertificate({
    voucherNo,
    amount,
    expiry,
    note: note || '', // 노트 필드 추가 (없으면 빈 문자열)
  });

  try {
    // 기프트카드 저장
    await newGiftCard.save();
    return NextResponse.json(
      { message: 'Gift certificate created', voucherNo, expiry },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create gift certificate' },
      { status: 500 }
    );
  }
}
