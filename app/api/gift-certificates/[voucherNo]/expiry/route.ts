// app/api/gift-certificates/[voucherNo]/expiry/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GiftCertificate from '@/models/GiftCertificate';
import { NextRequest } from 'next/server';

interface Context {
  params: {
    voucherNo: string;
  };
}

export async function PUT(request: NextRequest, context: Context) {
  await dbConnect();

  const { voucherNo } = context.params;

  if (!voucherNo) {
    return NextResponse.json({ error: 'Voucher number is required' }, { status: 400 });
  }

  try {
    const { expiry } = await request.json();

    if (!expiry) {
      return NextResponse.json({ error: 'Expiry date is required' }, { status: 400 });
    }

    const expiryDate = new Date(expiry);
    if (isNaN(expiryDate.getTime())) {
      return NextResponse.json({ error: 'Invalid expiry date format' }, { status: 400 });
    }

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
