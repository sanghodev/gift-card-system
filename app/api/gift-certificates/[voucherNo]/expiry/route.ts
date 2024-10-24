// app/api/gift-certificates/[voucherNo]/expiry/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GiftCertificate from '@/models/GiftCertificate';

export async function PUT(request: Request, { params }: { params: { voucherNo: string } }) {
  await dbConnect();
  const { voucherNo } = params;
  const { expiry } = await request.json();

  try {
    const updatedVoucher = await GiftCertificate.findOneAndUpdate(
      { voucherNo },
      { expiry },
      { new: true }
    );

    if (!updatedVoucher) {
      return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
    }

    return NextResponse.json(updatedVoucher);
  } catch (error) {
    console.error(error); 
    return NextResponse.json({ error: 'Failed to update expiry' }, { status: 500 });
  }
}
