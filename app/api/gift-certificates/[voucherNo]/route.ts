// app/api/gift-certificates/[voucherNo]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GiftCertificate from '@/models/GiftCertificate';

export async function GET(request: Request, { params }: { params: { voucherNo: string } }) {
  await dbConnect();

  const { voucherNo } = params;

  try {
    const giftCard = await GiftCertificate.findOne({ voucherNo });

    if (!giftCard) {
      return NextResponse.json({ error: 'Gift certificate not found' }, { status: 404 });
    }

    return NextResponse.json(giftCard);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to retrieve gift certificate' }, { status: 500 });
  }
}
