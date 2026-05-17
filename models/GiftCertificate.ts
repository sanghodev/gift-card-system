import mongoose, { Schema, Document } from 'mongoose';

export interface GiftCertificate extends Document {
  voucherNo: string;
  amount: number;
  expiry: Date;
  isUsed: boolean;
  note?: string; // 선택적인 노트 필드 추가
  createdAt: Date;
  usedAt?: Date; // 사용 일자 필드 추가
}

const GiftCertificateSchema: Schema = new Schema(
  {
    voucherNo: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, enum: [30, 50, 75] },
    expiry: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
    note: { type: String, default: '' }, // 노트 필드 추가
    usedAt: { type: Date, default: null }, // 사용 일자 저장
  },
  { timestamps: true }
);

export default mongoose.models.GiftCertificate || mongoose.model<GiftCertificate>('GiftCertificate', GiftCertificateSchema);
