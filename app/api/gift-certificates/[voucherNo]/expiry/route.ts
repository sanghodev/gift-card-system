// app/api/gift-certificates/[voucherNo]/expiry/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GiftCertificate from '@/models/GiftCertificate';
import { NextRequest } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { voucherNo: string } }) {
  await dbConnect(); // MongoDB 연결

  const { voucherNo } = params;

  if (!voucherNo) {
    return NextResponse.json({ error: 'Voucher number is required' }, { status: 400 });
  }

  try {
    const { expiry } = await request.json();

    if (!expiry) {
      return NextResponse.json({ error: 'Expiry date is required' }, { status: 400 });
    }

    // 만료일을 Date 객체로 변환
    const expiryDate = new Date(expiry);
    if (isNaN(expiryDate.getTime())) {
      return NextResponse.json({ error: 'Invalid expiry date format' }, { status: 400 });
    }

    // 바우처 만료일 업데이트
    const updatedVoucher = await GiftCertificate.findOneAndUpdate(
      { voucherNo },
      { expiry: expiryDate },
      { new: true }
    );

    if (!updatedVoucher) {
      return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Voucher expiry updated successfully', updatedVoucher });
  } catch (error) {
    console.error('Error updating voucher expiry:', error);
    return NextResponse.json({ error: 'Failed to update expiry' }, { status: 500 });
  }
}
