'use client';

import { useEffect, useState, useCallback } from 'react';

// 바우처 타입 정의
interface Voucher {
  voucherNo: string;
  amount: number;
  expiry: string;
  isUsed: boolean;
  createdAt: string;
}

const UsedVoucherList = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]); // Voucher 타입 배열로 상태 정의
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(50); // 50개 또는 100개 단위
  const [page, setPage] = useState(1);

  // 사용된 바우처를 가져오는 함수
  const fetchUsedVouchers = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      isUsed: 'true', // 사용된 바우처만 필터링
    });

    const response = await fetch(`/api/gift-certificates?${query.toString()}`);
    const data = await response.json();

    setVouchers(data.vouchers); // 상태 업데이트
    setTotal(data.total);
    setLoading(false);
  }, [limit, page]); // limit과 page를 의존성으로 사용

  useEffect(() => {
    fetchUsedVouchers();
  }, [fetchUsedVouchers]); // 의존성 배열에 메모이제이션된 fetchUsedVouchers

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setPage(1); // 페이지 리셋
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // 사용된 바우처를 다시 "사용되지 않음" 상태로 변경하는 함수
  const markAsUnused = async (voucherNo: string) => {
    const response = await fetch(`/api/gift-certificates/${voucherNo}/toggle-used`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isUsed: false }), // 사용 상태를 false로 변경
    });

    if (response.ok) {
      alert(`Voucher ${voucherNo} marked as unused.`);
      // 리스트에서 상태를 업데이트하여 즉시 반영
      setVouchers((prevVouchers) =>
        prevVouchers.filter((voucher) => voucher.voucherNo !== voucherNo)
      );
    } else {
      alert('Failed to mark voucher as unused.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Used Voucher List</h1>

      <table className="table-auto w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Voucher No</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Expiry</th>
            <th className="px-4 py-2">Used</th>
            <th className="px-4 py-2">Created At</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((voucher) => (
            <tr key={voucher.voucherNo}>
              <td className="border px-4 py-2">{voucher.voucherNo}</td>
              <td className="border px-4 py-2">${voucher.amount}</td>
              <td className="border px-4 py-2">{new Date(voucher.expiry).toLocaleDateString()}</td>
              <td className="border px-4 py-2">{voucher.isUsed ? 'Yes' : 'No'}</td>
              <td className="border px-4 py-2">{new Date(voucher.createdAt).toLocaleDateString()}</td>
              <td className="border px-4 py-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  onClick={() => markAsUnused(voucher.voucherNo)} // 사용되지 않음으로 되돌리는 버튼
                >
                  Mark as Unused
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <select value={limit} onChange={handleLimitChange} className="border p-2">
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
        <div className="flex space-x-2">
          {Array.from({ length: Math.ceil(total / limit) }, (_, index) => (
            <button
              key={index}
              className={`p-2 ${page === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsedVoucherList;
