// app/api/gift-certificates/[voucherNo]/toggle-used/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GiftCertificate from '@/models/GiftCertificate';
import { NextRequest } from 'next/server';

export async function PUT(request: NextRequest) {
  await dbConnect();

  // URL에서 voucherNo 추출
  const { pathname } = new URL(request.url);
  const voucherNo = pathname.split('/').slice(-2)[0]; // 경로에서 [voucherNo] 추출

  if (!voucherNo) {
    return NextResponse.json({ error: 'Voucher number is required' }, { status: 400 });
  }

  try {
    const voucher = await GiftCertificate.findOne({ voucherNo });

    if (!voucher) {
      return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
    }

    // 사용 여부를 토글
    const updatedVoucher = await GiftCertificate.findOneAndUpdate(
      { voucherNo },
      { isUsed: !voucher.isUsed },
      { new: true }
    );

    return NextResponse.json({
      message: `Voucher ${updatedVoucher.isUsed ? 'marked as used' : 'marked as unused'}`,
      updatedVoucher,
    });
  } catch (error) {
    console.error('Error updating voucher usage:', error);
    return NextResponse.json({ error: 'Failed to update voucher usage' }, { status: 500 });
  }
}
