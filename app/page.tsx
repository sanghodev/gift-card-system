import CreateVoucher from '@/components/CreateVoucher';
import CheckVoucher from '@/components/CheckVoucher';
import VoucherList from '@/components/VoucherList';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">Gift Card Control Center</h1>
        </div>
      </header>
      
      <main className="flex-grow p-6 max-w-[1600px] mx-auto w-full">
        {/* Desktop Layout: Sidebar + Main Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch h-full">
          {/* Left Panel: Actions */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <CreateVoucher />
            <CheckVoucher />
          </div>

          {/* Right Panel: Data Grid */}
          <div className="lg:col-span-3">
            <VoucherList />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
