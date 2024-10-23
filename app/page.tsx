'use client';

import Link from 'next/link';

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-4xl font-bold mb-12 text-primary">Gift Card Management System</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create Gift Card */}
        <Link
          href="/admin/create-giftcard"
          className="block p-6 bg-white shadow-card rounded-lg hover:shadow-xl transition-all duration-300"
        >
          <h2 className="text-xl font-semibold text-secondary mb-2">Create Gift Card</h2>
          <p className="text-gray-600">Create a new gift card for your store.</p>
        </Link>

        {/* Check Voucher */}
        <Link
          href="/customer/check-voucher"
          className="block p-6 bg-white shadow-card rounded-lg hover:shadow-xl transition-all duration-300"
        >
          <h2 className="text-xl font-semibold text-secondary mb-2">Check Voucher</h2>
          <p className="text-gray-600">Check the status of an existing voucher.</p>
        </Link>

        {/* Manage Vouchers */}
        <Link
          href="/admin/voucher-list"
          className="block p-6 bg-white shadow-card rounded-lg hover:shadow-xl transition-all duration-300"
        >
          <h2 className="text-xl font-semibold text-secondary mb-2">Manage Vouchers</h2>
          <p className="text-gray-600">View and manage all vouchers in the system.</p>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
