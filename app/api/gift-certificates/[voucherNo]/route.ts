// app/api/gift-certificates/[voucherNo]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GiftCertificate from '@/models/GiftCertificate';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  await dbConnect();

  // URL에서 voucherNo 추출
  const { pathname } = new URL(request.url);
  const voucherNo = pathname.split('/').slice(-1)[0]; // 경로에서 [voucherNo] 추출

  if (!voucherNo) {
    return NextResponse.json({ error: 'Voucher number is required' }, { status: 400 });
  }

  try {
    const voucher = await GiftCertificate.findOne({ voucherNo });

    if (!voucher) {
      return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
    }

    return NextResponse.json(voucher);
  } catch (error) {
    console.error('Error fetching voucher:', error);
    return NextResponse.json({ error: 'Failed to fetch voucher' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  await dbConnect();

  const { pathname } = new URL(request.url);
  const voucherNo = pathname.split('/').slice(-1)[0];

  if (!voucherNo) {
    return NextResponse.json({ error: 'Voucher number is required' }, { status: 400 });
  }

  try {
    const { note } = await request.json();

    const voucher = await GiftCertificate.findOneAndUpdate(
      { voucherNo },
      { note },
      { new: true }
    );

    if (!voucher) {
      return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
    }

    return NextResponse.json(voucher);
  } catch (error) {
    console.error('Error updating voucher note:', error);
    return NextResponse.json({ error: 'Failed to update voucher note' }, { status: 500 });
  }
}
