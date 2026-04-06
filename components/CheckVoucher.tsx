'use client';

import { useState } from 'react';

interface Voucher {
  voucherNo: string;
  amount: number;
  expiry: string;
  isUsed: boolean;
  note?: string;
}

const CheckVoucher = () => {
  const [voucherNo, setVoucherNo] = useState('');
  const [result, setResult] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherNo.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/gift-certificates/${voucherNo}`);
      const data = await response.json();

      if (response.ok) {
        setResult(data as Voucher);
      } else {
        setError(data.error || 'Failed to fetch voucher');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while fetching the voucher');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatExpiryDate = (expiry: string) => {
    const date = new Date(expiry);
    return date.toLocaleDateString();
  };

  const markAsUsed = async () => {
    if (!result) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/gift-certificates/${voucherNo}/toggle-used`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isUsed: true }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult({ ...result, isUsed: true });
      } else {
        alert(`Failed to update usage status: ${data.error}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(`Error updating voucher status: ${err.message}`);
      } else {
        alert('An unexpected error occurred while updating the voucher');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-6 text-primary">Check & Use Voucher</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Voucher Number</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={voucherNo}
              onChange={(e) => setVoucherNo(e.target.value)}
              placeholder="Enter voucher code"
              className="flex-grow border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary shadow-sm"
              disabled={loading}
            />
            <button
              type="submit"
              className={`px-4 py-2.5 rounded-lg text-white font-semibold shadow transition-colors whitespace-nowrap ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-secondary hover:bg-blue-600'
              }`}
              disabled={loading || !voucherNo}
            >
              Check
            </button>
          </div>
        </div>
      </form>

      {/* Results / Status */}
      <div className="mt-6 flex-grow flex flex-col">
        {error && <p className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">{error}</p>}
        
        {loading && !result && !error && (
          <p className="text-gray-500 text-sm flex items-center justify-center h-full">Loading...</p>
        )}

        {result && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm flex flex-col flex-grow">
            <h3 className="font-semibold text-gray-800 mb-3 text-base">Voucher Details</h3>
            <div className="flex justify-between border-b pb-2 mb-2 border-gray-200">
              <span className="text-gray-600">Amount</span>
              <span className="font-bold text-gray-900">${result.amount}</span>
            </div>
            <div className="flex justify-between border-b pb-2 mb-2 border-gray-200">
              <span className="text-gray-600">Expiry</span>
              <span className="font-medium text-gray-900">{formatExpiryDate(result.expiry)}</span>
            </div>
            <div className="flex justify-between border-b pb-2 mb-4 border-gray-200">
              <span className="text-gray-600">Status</span>
              <span className={`font-bold ${result.isUsed ? 'text-red-600' : 'text-green-600'}`}>
                {result.isUsed ? 'Already Used' : 'Valid / Unused'}
              </span>
            </div>

            <div className="mt-auto">
              {!result.isUsed ? (
                <button
                  onClick={markAsUsed}
                  className="w-full bg-green-500 text-white font-semibold py-2.5 shadow rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Mark as Used'}
                </button>
              ) : (
                <button
                  className="w-full bg-gray-200 text-gray-500 font-semibold py-2.5 rounded-lg cursor-not-allowed"
                  disabled
                >
                  Cannot use again
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckVoucher;
