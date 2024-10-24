// app/api/gift-certificates/[voucherNo]/toggle-used/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GiftCertificate from '@/models/GiftCertificate';

export async function PUT(request: Request, { params }: { params: { voucherNo: string } }) {
  await dbConnect();
  const { voucherNo } = params;
  const { isUsed } = await request.json();

  try {
    const updatedVoucher = await GiftCertificate.findOneAndUpdate(
      { voucherNo },
      { isUsed },
      { new: true }
    );

    if (!updatedVoucher) {
      return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
    }

    return NextResponse.json(updatedVoucher);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update usage status' }, { status: 500 });
  }
}
