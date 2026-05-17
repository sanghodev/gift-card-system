'use client';

import { useEffect, useState, useCallback } from 'react';

// 바우처 타입 정의
interface Voucher {
  voucherNo: string;
  amount: number;
  expiry: string;
  isUsed: boolean;
  createdAt: string;
  usedAt?: string;
  note?: string;
}

const VoucherList = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(''); // 디바운스용 상태
  const [amountFilter, setAmountFilter] = useState('');
  const [isUsedFilter, setIsUsedFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Note inline editing states
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteValue, setEditingNoteValue] = useState('');

  // 검색어 입력 시 300ms 후에 API 요청을 하도록 디바운스 처리 (문자가 끊기는 버그 해결)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // 검색어가 바뀌면 1페이지로 리셋
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // fetchVouchers 함수 메모이제이션
  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const query = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      search: debouncedSearch,
      amount: amountFilter,
      isUsed: isUsedFilter,
      from: fromDate,
      to: toDate,
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
  }, [limit, page, debouncedSearch, amountFilter, isUsedFilter, fromDate, toDate]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setPage(1);
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
      alert(errorMessage);
    }
  };

  const updateNote = async (voucherNo: string, newNote: string) => {
    try {
      const response = await fetch(`/api/gift-certificates/${voucherNo}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote }),
      });
      if (!response.ok) throw new Error('Failed to update note');
      
      setVouchers(prev => prev.map(v => v.voucherNo === voucherNo ? { ...v, note: newNote } : v));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setEditingNoteId(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">Manage Vouchers</h2>
        {loading && <span className="text-sm text-gray-500 font-medium animate-pulse">Fetching records...</span>}
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {/* 직관적인 Status 탭 (기존 Dropdown을 대체) */}
      <div className="flex space-x-4 mb-5 border-b border-gray-200">
        <button 
          onClick={() => { setIsUsedFilter(''); setPage(1); }}
          className={`pb-2 px-1 text-sm font-semibold transition-colors border-b-2 ${!isUsedFilter ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >All Vouchers</button>
        <button 
          onClick={() => { setIsUsedFilter('false'); setPage(1); }}
          className={`pb-2 px-1 text-sm font-semibold transition-colors border-b-2 ${isUsedFilter === 'false' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >Valid (Unused)</button>
        <button 
          onClick={() => { setIsUsedFilter('true'); setPage(1); }}
          className={`pb-2 px-1 text-sm font-semibold transition-colors border-b-2 ${isUsedFilter === 'true' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >Already Used</button>
      </div>

      {/* 필터 및 검색 UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)} // 입력 지연 없이 바로 상태 업데이트
          className="xl:col-span-1 border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm"
        />

        <select
          value={amountFilter}
          onChange={(e) => { setAmountFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm"
        >
          <option value="">Any Amount</option>
          <option value="30">$30</option>
          <option value="50">$50</option>
          <option value="75">$75</option>
        </select>

        {/* 날짜 필터 UI */}
        <input
          type="date"
          value={fromDate}
          onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm text-gray-600"
          title="From Date"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => { setToDate(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm text-gray-600"
          title="To Date"
        />
      </div>

      {/* 테이블 영역 (로딩 시 살짝 투명하게 처리) */}
      <div className={`overflow-x-auto rounded-lg border border-gray-200 flex-grow relative transition-opacity duration-200 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Voucher No</th>
              <th className="py-3 px-4 text-left font-semibold">Amount</th>
              <th className="py-3 px-4 text-left font-semibold">Created On</th>
              <th className="py-3 px-4 text-left font-semibold">Expiry</th>
              <th className="py-3 px-4 text-left font-semibold text-center">Status</th>
              <th className="py-3 px-4 text-left font-semibold text-center">Used On</th>
              <th className="py-3 px-4 text-left font-semibold text-center">Notes</th>
              <th className="py-3 px-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vouchers.length > 0 ? (
              vouchers.map((voucher) => (
                <tr key={voucher.voucherNo} className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs">{voucher.voucherNo}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">${voucher.amount}</td>
                  <td className="py-3 px-4 text-gray-500">{new Date(voucher.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-gray-500">{new Date(voucher.expiry).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${voucher.isUsed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {voucher.isUsed ? 'Used' : 'Valid'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-500 text-xs">
                    {voucher.usedAt ? new Date(voucher.usedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-center max-w-[120px]" title={voucher.note || 'Click to edit'}>
                    {editingNoteId === voucher.voucherNo ? (
                      <input
                        autoFocus
                        type="text"
                        value={editingNoteValue}
                        onChange={(e) => setEditingNoteValue(e.target.value)}
                        onBlur={() => updateNote(voucher.voucherNo, editingNoteValue)}
                        onKeyDown={(e) => { if (e.key === 'Enter') updateNote(voucher.voucherNo, editingNoteValue); }}
                        className="w-full border border-primary rounded p-1 text-xs outline-none"
                      />
                    ) : (
                      <div 
                        className="cursor-text hover:bg-gray-100 p-1.5 rounded truncate border border-transparent hover:border-gray-300 transition-colors text-xs"
                        onClick={() => {
                          setEditingNoteId(voucher.voucherNo);
                          setEditingNoteValue(voucher.note || '');
                        }}
                      >
                        {voucher.note || <span className="text-gray-300 italic">Add note...</span>}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggleUsage(voucher.voucherNo, voucher.isUsed)}
                      className={`py-1.5 px-3 rounded text-xs font-medium transition-colors shadow-sm whitespace-nowrap ${
                        voucher.isUsed
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      {voucher.isUsed ? 'Reactivate' : 'Consume'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-500">
                  No vouchers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-100 text-sm">
        <div className="flex items-center text-gray-600 mb-4 sm:mb-0">
          <span className="mr-3 text-sm font-medium">Rows per page:</span>
          <select
            value={limit}
            onChange={handleLimitChange}
            className="border border-gray-300 rounded shadow-sm p-1.5 outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        
        <div className="flex space-x-1 overflow-x-auto max-w-full pb-2 sm:pb-0">
          {Array.from({ length: Math.ceil(total / limit) }, (_, index) => (
            <button
              key={index}
              className={`px-3 py-1.5 rounded-md font-medium min-w-[32px] transition-colors shadow-sm ${
                page === index + 1 ? 'bg-primary text-white border-transparent' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
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
