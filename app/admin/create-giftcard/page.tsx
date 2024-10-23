'use client';

import { useState } from 'react';

const CreateGiftCard = () => {
  const [amount, setAmount] = useState(30);
  const [expiry, setExpiry] = useState('');
  const [note, setNote] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [voucherDetails, setVoucherDetails] = useState(null); 

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
    <div className="container mx-auto p-6 bg-background min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">Create Gift Card</h1>

      {/* 성공 여부에 따라 리뷰 표시 */}
      {success && voucherDetails && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
          <h2 className="text-lg font-semibold">Gift Card Created Successfully!</h2>
          <p><strong>Voucher No:</strong> {voucherDetails.voucherNo}</p>
          <p><strong>Amount:</strong> ${amount}</p>
          
          {/* 클라이언트에서만 렌더링되도록 보장 */}
          <p><strong>Expiry Date:</strong> {typeof window !== 'undefined' ? new Date(voucherDetails.expiry).toLocaleDateString() : ''}</p>

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
          className={`py-3 px-6 rounded-lg text-white font-semibold transition-colors ${loading ? 'bg-gray-400' : 'bg-primary hover:bg-blue-700'}`}
        >
          {loading ? 'Creating...' : 'Create Gift Card'}
        </button>
      </div>
    </div>
  );
};

export default CreateGiftCard;
