'use client';

import { useState } from 'react';

// 바우처 세부 정보 타입 정의
interface VoucherDetails {
  voucherNo: string;
  amount: number;
  expiry: string;
  note?: string;
}

const CreateVoucher = () => {
  const [amount, setAmount] = useState<number>(30); // 숫자 타입으로 설정
  const [expiry, setExpiry] = useState('');
  const [note, setNote] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [voucherDetails, setVoucherDetails] = useState<VoucherDetails | null>(null);

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
      setVoucherDetails(data); 
      console.log("Voucher Details: ", data); 
      setSuccess(true);
      setAmount(30); 
      setExpiry('');
      setNote(''); 
    } else {
      setSuccess(false);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-6 text-primary">Issue New Voucher</h2>

      {/* 성공 여부에 따라 리뷰 표시 */}
      {success && voucherDetails && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Voucher Created!</h3>
          <p><strong>No:</strong> {voucherDetails.voucherNo}</p>
          <p><strong>Amount:</strong> ${voucherDetails.amount}</p>
          <p><strong>Expiry:</strong> {new Date(voucherDetails.expiry).toLocaleDateString()}</p>
          {voucherDetails.note && <p><strong>Note:</strong> {voucherDetails.note}</p>}
        </div>
      )}

      <div className="flex flex-col gap-4 flex-grow">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Amount</label>
          <select
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          >
            <option value={30}>$30</option>
            <option value={50}>$50</option>
            <option value={75}>$75</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Expiry Date</label>
          <input
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Optional Note</label>
          <textarea
            placeholder="Add note here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            rows={3}
          />
        </div>

        <div className="mt-auto pt-4">
          <button
            onClick={createGiftCard}
            disabled={loading}
            className={`w-full py-2.5 px-4 rounded-lg text-white font-semibold shadow transition-colors ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-blue-700'
            }`}
          >
            {loading ? 'Creating...' : 'Create Voucher'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateVoucher;
