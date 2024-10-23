// app/api/gift-certificates/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GiftCertificate from '@/models/GiftCertificate';

export async function GET(request: Request) {
  await dbConnect();

  const { search, amount, isUsed, from, to, limit = 50, page = 1 } = Object.fromEntries(new URL(request.url).searchParams);

  const query: any = {};

  if (amount) query.amount = amount;
  if (isUsed !== undefined) query.isUsed = isUsed === 'true';
  if (search) query.voucherNo = { $regex: search, $options: 'i' };
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }

  const limitNum = parseInt(limit as string, 10);
  const skip = (parseInt(page as string, 10) - 1) * limitNum;

  try {
    const total = await GiftCertificate.countDocuments(query);
    const vouchers = await GiftCertificate.find(query)
      .limit(limitNum)
      .skip(skip)
      .sort({ createdAt: -1 });

    return NextResponse.json({
      vouchers, // 'createdAt' 필드가 포함된 결과 반환
      total,
      page: parseInt(page as string, 10),
      limit: limitNum,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve vouchers' }, { status: 500 });
  }
}
