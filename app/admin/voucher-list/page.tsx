'use client';

import { useEffect, useState, useCallback } from 'react';

// 바우처 타입 정의
interface Voucher {
  voucherNo: string;
  amount: number;
  expiry: string;
  isUsed: boolean;
  createdAt: string;
  note?: string;
}

const VoucherList = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]); // Voucher 배열 타입 지정
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // 에러 상태 추가
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(50); // 50개 또는 100개 단위
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [amountFilter, setAmountFilter] = useState('');
  const [isUsedFilter, setIsUsedFilter] = useState('');
  const [fromDate, setFromDate] = useState(''); // 시작 날짜
  const [toDate, setToDate] = useState(''); // 종료 날짜

  // fetchVouchers 함수 메모이제이션
  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    setError(null); // 에러 초기화
    const query = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      search,
      amount: amountFilter,
      isUsed: isUsedFilter,
      from: fromDate, // 날짜 필터링에 사용
      to: toDate, // 날짜 필터링에 사용
    });

    try {
      const response = await fetch(`/api/gift-certificates?${query.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch vouchers');
      }

      const data = await response.json();
      if (!data || typeof data !== 'object' || !Array.isArray(data.vouchers)) {
        throw new Error('Invalid response format');
      }

      setVouchers(data.vouchers);
      setTotal(data.total);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [limit, page, search, amountFilter, isUsedFilter, fromDate, toDate]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]); // fetchVouchers 함수가 변경될 때만 호출

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setPage(1); // 페이지 리셋
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const toggleUsage = async (voucherNo: string, isUsed: boolean) => {
    try {
      const response = await fetch(`/api/gift-certificates/${voucherNo}/toggle-used`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isUsed: !isUsed }),
      });

      if (!response.ok) {
        throw new Error('Failed to update voucher usage');
      }

      setVouchers((prevVouchers) =>
        prevVouchers.map((voucher) =>
          voucher.voucherNo === voucherNo ? { ...voucher, isUsed: !isUsed } : voucher
        )
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      alert(errorMessage); // 에러 경고 표시
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-background min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-primary">Manage Vouchers</h1>

      {/* 필터 및 검색 UI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <input
          type="text"
          placeholder="Search by voucher number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <select
          value={amountFilter}
          onChange={(e) => setAmountFilter(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Filter by Amount</option>
          <option value="30">$30</option>
          <option value="50">$50</option>
          <option value="75">$75</option>
        </select>

        <select
          value={isUsedFilter}
          onChange={(e) => setIsUsedFilter(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Vouchers</option>
          <option value="true">Used Vouchers</option>
          <option value="false">Unused Vouchers</option>
        </select>

        {/* 날짜 필터 UI */}
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="From Date"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="To Date"
        />
      </div>

      {/* 테이블 형식으로 바우처 리스트 표시 */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-primary text-white">
              <th className="py-3 px-6 text-left">Voucher No</th>
              <th className="py-3 px-6 text-left">Amount</th>
              <th className="py-3 px-6 text-left">Expiry</th>
              <th className="py-3 px-6 text-left">Used</th>
              <th className="py-3 px-6 text-left">Created At</th>
              <th className="py-3 px-6 text-left">Note</th> {/* 노트 필드 */}
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((voucher) => (
              <tr key={voucher.voucherNo} className="hover:bg-gray-100 transition-colors">
                <td className="py-4 px-6 border-b border-gray-200">{voucher.voucherNo}</td>
                <td className="py-4 px-6 border-b border-gray-200">${voucher.amount}</td>
                <td className="py-4 px-6 border-b border-gray-200">{new Date(voucher.expiry).toLocaleDateString()}</td>
                <td className="py-4 px-6 border-b border-gray-200">{voucher.isUsed ? 'Yes' : 'No'}</td>
                <td className="py-4 px-6 border-b border-gray-200">{new Date(voucher.createdAt).toLocaleDateString()}</td>
                <td className="py-4 px-6 border-b border-gray-200">{voucher.note || 'N/A'}</td> {/* 노트 표시 */}
                <td className="py-4 px-6 border-b border-gray-200">
                  <button
                    onClick={() => toggleUsage(voucher.voucherNo, voucher.isUsed)}
                    className={`py-2 px-4 rounded-lg text-white font-semibold transition-colors ${
                      voucher.isUsed
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {voucher.isUsed ? 'Mark as Unused' : 'Mark as Used'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-8">
        <select
          value={limit}
          onChange={handleLimitChange}
          className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
        <div className="flex space-x-2">
          {Array.from({ length: Math.ceil(total / limit) }, (_, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-lg font-semibold ${
                page === index + 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
              } hover:bg-gray-300 transition-colors`}
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

export default VoucherList;
