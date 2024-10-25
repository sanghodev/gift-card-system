'use client';

import { useState } from 'react';

// 바우처 세부 정보 타입 정의
interface VoucherDetails {
  voucherNo: string;
  amount: number;
  expiry: string;
  note?: string;
}

const CreateGiftCard = () => {
  const [amount, setAmount] = useState<number>(30); // 숫자 타입으로 설정
  const [expiry, setExpiry] = useState('');
  const [note, setNote] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [voucherDetails, setVoucherDetails] = useState<VoucherDetails | null>(null); // 초기값 null로 설정

  const createGiftCard = async () => {
    setLoading(true);
    setSuccess(false); 
    setVoucherDetails(null);

    const response = await fetch('/api/gift-certificates/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, expiry, note }), 
    });

    if (response.ok) {
      const data = await response.json();
      setVoucherDetails(data); // 바우처 정보 설정
      console.log("Voucher Details: ", data); 
      setSuccess(true);
      setAmount(30); // 입력 값 초기화
      setExpiry('');
      setNote(''); 
    } else {
      setSuccess(false); // 실패 시 처리
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 bg-background min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">Create Gift Card</h1>

      {/* 성공 여부에 따라 리뷰 표시 */}
      {success && voucherDetails && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
          <h2 className="text-lg font-semibold">Gift Card Created Successfully!</h2>
          <p><strong>Voucher No:</strong> {voucherDetails.voucherNo}</p>
          <p><strong>Amount:</strong> ${voucherDetails.amount}</p> {/* Amount 수정 */}
          {console.log("Amount in JSX:", voucherDetails.amount)} {/* 여기서 콘솔에 amount 확인 */}
          <p><strong>Expiry Date:</strong> {new Date(voucherDetails.expiry).toLocaleDateString()}</p>

          {voucherDetails.note && <p><strong>Note:</strong> {voucherDetails.note}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mb-6">
        <select
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value={30}>$30</option>
          <option value={50}>$50</option>
          <option value={75}>$75</option>
        </select>

        <input
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <textarea
          placeholder="Optional note for this gift card"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
          rows={4}
        />

        <button
          onClick={createGiftCard}
          disabled={loading}
          className={`py-3 px-6 rounded-lg text-white font-semibold transition-colors ${
            loading ? 'bg-gray-400' : 'bg-primary hover:bg-blue-700'
          }`}
        >
          {loading ? 'Creating...' : 'Create Gift Card'}
        </button>
      </div>
    </div>
  );
};

export default CreateGiftCard;
