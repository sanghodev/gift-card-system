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
  const [result, setResult] = useState<Voucher | null>(null); // 조회 결과를 Voucher 타입으로 설정
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Voucher 조회 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/gift-certificates/${voucherNo}`);
      const data = await response.json();

      if (response.ok) {
        setResult(data as Voucher); // 응답 데이터를 Voucher 타입으로 지정
      } else {
        setError(data.error || 'Failed to fetch voucher');
      }
    } catch (err: unknown) {
      setError('An error occurred while fetching the voucher');
    } finally {
      setLoading(false);
    }
  };

  const formatExpiryDate = (expiry: string) => {
    const date = new Date(expiry);
    return date.toLocaleDateString(); // 날짜 포맷을 클라이언트에서 처리
  };

  // 사용 여부 업데이트 함수
  const markAsUsed = async () => {
    if (!result) return;

    try {
      const response = await fetch(`/api/gift-certificates/${voucherNo}/toggle-used`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isUsed: true }), // 사용 여부를 true로 설정
      });

      const data = await response.json();
      if (response.ok) {
        alert('Voucher marked as used');
        setResult({ ...result, isUsed: true }); // 사용 여부 업데이트
      } else {
        alert(`Failed to update usage status: ${data.error}`);
      }
    } catch (err: unknown) {
      alert('An error occurred while updating the voucher');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4">Check Gift Voucher</h1>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 font-semibold">Voucher No:</label>
          <input
            type="text"
            value={voucherNo}
            onChange={(e) => setVoucherNo(e.target.value)}
            className="block w-full border border-gray-300 rounded p-2 mb-4"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            {loading ? 'Checking...' : 'Check Voucher'}
          </button>
        </form>

        {loading && <p className="mt-4">Loading...</p>}
        {error && <p className="mt-4 text-red-500">{error}</p>}

        {result && (
          <div className="mt-4">
            <p>
              <span className="font-semibold">Amount:</span> ${result.amount}
            </p>
            <p>
              <span className="font-semibold">Expiry:</span> {formatExpiryDate(result.expiry)}
            </p>
            <p>
              <span className="font-semibold">Used:</span> {result.isUsed ? 'Yes' : 'No'}
            </p>

            {/* Mark as Used 버튼은 사용되지 않은 경우에만 표시 */}
            {!result.isUsed && (
              <button
                onClick={markAsUsed}
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 mt-4"
              >
                Mark as Used
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckVoucher;
