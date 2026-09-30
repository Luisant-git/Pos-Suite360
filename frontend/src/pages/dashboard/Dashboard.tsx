import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  ShoppingCart,
  TrendingDown,
  Package,
  RotateCcw,
  Wallet,
  Landmark,
  Users,
  BarChart3,
  LayoutDashboard,
  ListTodo,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';

const StatCard = ({ title, value, icon: Icon, colorClass, desc, layout = 'topbar', reportUrl }: any) => {
  const strValue = String(value);
  let valueSizeClass = "text-xl sm:text-2xl"; // Normal size

  if (layout === 'sidebar') {
    if (strValue.length > 14) {
      valueSizeClass = "text-sm sm:text-base tracking-tighter";
    } else if (strValue.length > 11) {
      valueSizeClass = "text-base sm:text-lg tracking-tight";
    } else if (strValue.length > 9) {
      valueSizeClass = "text-lg sm:text-xl tracking-tight";
    }
  } else {
    if (strValue.length > 15) {
      valueSizeClass = "text-sm sm:text-base lg:text-lg tracking-tighter";
    } else if (strValue.length > 12) {
      valueSizeClass = "text-base sm:text-lg lg:text-xl tracking-tight";
    }
  }

  return (
    <div className="bg-white border border-[#E6E9ED] shadow-sm p-3 relative flex flex-col justify-between hover:shadow-md transition-shadow gap-2 group h-full rounded-xl">
      <div className="flex items-start justify-between gap-2 w-full">
        <div className="min-w-0 flex-1">
          <h3 className={`${valueSizeClass} font-bold text-black whitespace-nowrap`}>{value}</h3>
          <p className="text-[11px] sm:text-[12px] text-black font-bold mt-0.5 uppercase tracking-wide leading-tight">{title}</p>
          {desc && <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 truncate">{desc}</p>}
        </div>
        <div className={`p-2.5 ${colorClass} text-white flex-shrink-0 flex items-center justify-center shadow-inner rounded-xl`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
      {reportUrl && (
        <div className="mt-2 pt-2 border-t border-gray-100 flex justify-end">
          <Link to={reportUrl} className="inline-flex items-center justify-center bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-[11px] font-bold hover:bg-blue-600 hover:text-white transition-colors duration-300">
            View Report <span aria-hidden="true" className="ml-1 transition-transform duration-300 group-hover:translate-x-0.5"><ArrowRight size={14} className="ml-1.5" /></span>
          </Link>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { desktopLayout } = useOutletContext<any>() || { desktopLayout: 'topbar' };
  const { formatCurrency } = useSettings();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const getMalaysiaDate = () => {
    const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" }));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [filterStartDate, setFilterStartDate] = useState(getMalaysiaDate());
  const [filterEndDate, setFilterEndDate] = useState(getMalaysiaDate());
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [supplierSearch, setSupplierSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDateTime = `${currentDateTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kuala_Lumpur' })} ${currentDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kuala_Lumpur' })}`;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        // Ensure api is imported correctly.
        const response = await api.get(`/dashboard/summary?startDate=${filterStartDate}&endDate=${filterEndDate}`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [filterStartDate, filterEndDate]);

  if (loading || !data) {
    return (
      <div className="bg-[#F3F5F8] min-h-[calc(100vh-100px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-[#2563EB] border-blue-200 rounded-full animate-spin shadow-md"></div>
          <p className="text-[15px] font-bold text-black font-bold tracking-wide">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  // const todayStr = getMalaysiaDate();
  // const isToday = filterStartDate === todayStr && filterEndDate === todayStr;
  // const prefix = isToday ? "Today's" : "Filtered";
  // const descPrefix = isToday ? "Today's" : "Period";

  const renderOperationalGrid = (isOverviewTab: boolean) => (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${isOverviewTab ? 'hidden lg:grid mt-6' : ''}`}>
        {/* Low Stock Products */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden lg:col-span-1">
          <div className="border-b border-gray-100 px-4 sm:px-5 py-3 sm:py-4 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-[15px] sm:text-[16px] font-bold text-black font-bold flex items-center gap-2">
              <Package size={18} className="text-rose-500" /> Low Stock Alerts
            </h2>
          </div>
          <div className="p-0 h-[350px] overflow-y-auto custom-scrollbar bg-white">
            {data.lowStockProducts && data.lowStockProducts.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {data.lowStockProducts.map((product: any, idx: number) => (
                  <li key={idx} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                    <div>
                      <p className="text-[13px] font-bold text-black font-bold break-words pr-2">{product.name}</p>
                      <p className="text-[11px] font-bold text-gray-500 font-bold mt-1">Code: {product.code}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 bg-rose-100 text-rose-700 text-[12px] font-bold rounded-full font-bold">
                        {product.currentStock} left
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3 px-4">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                  <Package className="text-gray-400" size={24} />
                </div>
                <p className="text-[13px] font-bold text-black font-bold text-center">All stock levels are optimal</p>
              </div>
            )}
          </div>
        </div>

        {/* Supplier Payments Due */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden lg:col-span-1 flex flex-col">
          <div className="border-b border-gray-100 px-4 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50/50 gap-3 sm:gap-2">
            <h2 className="text-[15px] sm:text-[16px] font-bold text-black font-bold flex items-center gap-2">
              <Landmark size={18} className="text-rose-500" /> Supplier Payments Due
            </h2>
            <div className="flex items-center justify-start sm:justify-end gap-2 w-full sm:w-auto">
              <Link to="/reports/supplier-payments" className="flex-1 sm:flex-none text-center px-3 py-1.5 sm:py-1 bg-white border border-gray-200 text-gray-700 font-bold rounded hover:bg-gray-50 transition-colors text-[12px]">
                View All
              </Link>
              <Link to="/purchase/payments" className="flex-1 sm:flex-none text-center px-3 py-1.5 sm:py-1 bg-rose-50 text-rose-600 font-bold rounded hover:bg-rose-100 transition-colors text-[12px]">
                Settle
              </Link>
            </div>
          </div>
          {/* Supplier Search Bar */}
          <div className="px-4 py-2 border-b border-gray-100 bg-white">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                placeholder="Search supplier or bill..."
                value={supplierSearch}
                onChange={e => setSupplierSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-rose-300 bg-gray-50"
              />
            </div>
          </div>
          <div className="flex-1 p-0 h-[350px] overflow-y-auto custom-scrollbar bg-white">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-bold text-black font-bold">Supplier / Bill</th>
                  <th className="px-4 py-3 font-bold text-[#059669] text-right whitespace-nowrap">Pending</th>
                </tr>
              </thead>
              <tbody>
                {data.unpaidSupplierBills?.filter((bill: any) =>
                  !supplierSearch ||
                  bill.entityName?.toLowerCase().includes(supplierSearch.toLowerCase()) ||
                  bill.entryNo?.toLowerCase().includes(supplierSearch.toLowerCase())
                ).length > 0 ? data.unpaidSupplierBills.filter((bill: any) =>
                  !supplierSearch ||
                  bill.entityName?.toLowerCase().includes(supplierSearch.toLowerCase()) ||
                  bill.entryNo?.toLowerCase().includes(supplierSearch.toLowerCase())
                ).map((bill: any, idx: number) => (
                  <tr key={idx} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3">
                      <div className="font-bold text-black font-bold break-words">{bill.entityName}</div>
                      <div className="text-black font-bold text-[11px] mt-0.5">
                        {bill.entryNo} • {new Date(bill.date).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-bold text-[#059669]">{formatCurrency(bill.pending)}</div>
                      <div className="text-black font-bold text-[11px] mt-0.5">
                        Total: {formatCurrency(bill.total)}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-black font-bold">
                      {supplierSearch ? 'No results found' : 'No pending supplier bills'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Payments Expected */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden lg:col-span-1 flex flex-col">
          <div className="border-b border-gray-100 px-4 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50/50 gap-3 sm:gap-2">
            <h2 className="text-[15px] sm:text-[16px] font-bold text-black font-bold flex items-center gap-2">
              <Users size={18} className="text-amber-500" /> Customer Payments Due
            </h2>
            <div className="flex items-center justify-start sm:justify-end gap-2 w-full sm:w-auto">
              <Link to="/reports/customer-receipts" className="flex-1 sm:flex-none text-center px-3 py-1.5 sm:py-1 bg-white border border-gray-200 text-gray-700 font-bold rounded hover:bg-gray-50 transition-colors text-[12px]">
                View All
              </Link>
              <Link to="/sales/receipts" className="flex-1 sm:flex-none text-center px-3 py-1.5 sm:py-1 bg-amber-50 text-amber-600 font-bold rounded hover:bg-amber-100 transition-colors text-[12px]">
                Collect
              </Link>
            </div>
          </div>
          {/* Customer Search Bar */}
          <div className="px-4 py-2 border-b border-gray-100 bg-white">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                placeholder="Search customer or bill..."
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-300 bg-gray-50"
              />
            </div>
          </div>
          <div className="flex-1 p-0 h-[350px] overflow-y-auto custom-scrollbar bg-white">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-bold text-black font-bold">Customer / Bill</th>
                  <th className="px-4 py-3 font-bold text-[#059669] text-right whitespace-nowrap">Pending</th>
                </tr>
              </thead>
              <tbody>
                {data.unpaidCustomerBills?.filter((bill: any) =>
                  !customerSearch ||
                  bill.entityName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  bill.entryNo?.toLowerCase().includes(customerSearch.toLowerCase())
                ).length > 0 ? data.unpaidCustomerBills.filter((bill: any) =>
                  !customerSearch ||
                  bill.entityName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  bill.entryNo?.toLowerCase().includes(customerSearch.toLowerCase())
                ).map((bill: any, idx: number) => (
                  <tr key={idx} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3">
                      <div className="font-bold text-black font-bold break-words">{bill.entityName}</div>
                      <div className="text-black font-bold text-[11px] mt-0.5">
                        {bill.entryNo} • {new Date(bill.date).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-bold text-[#059669]">{formatCurrency(bill.pending)}</div>
                      <div className="text-black font-bold text-[11px] mt-0.5">
                        Total: {formatCurrency(bill.total)}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-black font-bold">
                      {customerSearch ? 'No results found' : 'No pending customer bills'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );

  return (
    <div className="bg-[#F3F5F8] min-h-full pb-8">
      {/*
      Quick Launchpad for POS
      <div className="mb-8">
        <h2 className="text-[20px] font-bold text-black font-bold mb-4 flex items-center gap-2">
          <Zap className="text-amber-500" /> Quick Launchpad
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <QuickAction 
            title="Sales Entry" 
            desc="Open POS Terminal" 
            icon={MonitorPlay} 
            to="/sales/pos" 
            colorClass="hover:border-blue-500 [&>div:first-child]:text-blue-600 [&>div:first-child]:bg-blue-50"
          />
          <QuickAction 
            title="Customer Receipts" 
            desc="Collect Payments" 
            icon={Wallet} 
            to="/sales/receipts" 
            colorClass="hover:border-emerald-500 [&>div:first-child]:text-emerald-600 [&>div:first-child]:bg-emerald-50"
          />
          <QuickAction 
            title="Purchase Entry" 
            desc="Record Inwards" 
            icon={Truck} 
            to="/purchase/new" 
            colorClass="hover:border-purple-500 [&>div:first-child]:text-purple-600 [&>div:first-child]:bg-purple-50"
          />
          <QuickAction 
            title="Supplier Payments" 
            desc="Pay Vendors" 
            icon={CreditCard} 
            to="/purchase/payments" 
            colorClass="hover:border-rose-500 [&>div:first-child]:text-rose-600 [&>div:first-child]:bg-rose-50"
          />
          <QuickAction 
            title="Products" 
            desc="Manage Inventory" 
            icon={Package} 
            to="/master/products" 
            colorClass="hover:border-amber-500 [&>div:first-child]:text-amber-600 [&>div:first-child]:bg-amber-50"
          />
          <QuickAction 
            title="Sales Report" 
            desc="View Analytics" 
            icon={BarChart3} 
            to="/reports/sales" 
            colorClass="hover:border-indigo-500 [&>div:first-child]:text-indigo-600 [&>div:first-child]:bg-indigo-50"
          />
        </div>
      </div>
      */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-black font-bold">Financial Overview</h1>
          <p className="text-[13px] font-bold text-blue-600 mt-1 flex items-center gap-1.5">
            <i className="fa fa-clock-o"></i> {formattedDateTime}
          </p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2 sm:px-2.5 py-1.5 sm:py-2 border border-gray-200 rounded-xl shadow-sm w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-gray-50/80 border border-gray-100 px-2 py-1.5 rounded-lg flex-1 sm:flex-none overflow-hidden">
            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider hidden sm:inline">From</span>
            <input 
              type="date" 
              value={filterStartDate} 
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="text-[12px] sm:text-[13px] font-bold text-black bg-transparent outline-none cursor-pointer w-full sm:w-auto"
            />
          </div>
          <span className="text-gray-300 font-bold">-</span>
          <div className="flex items-center gap-1.5 bg-gray-50/80 border border-gray-100 px-2 py-1.5 rounded-lg flex-1 sm:flex-none overflow-hidden">
            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider hidden sm:inline">To</span>
            <input 
              type="date" 
              value={filterEndDate} 
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="text-[12px] sm:text-[13px] font-bold text-black bg-transparent outline-none cursor-pointer w-full sm:w-auto"
            />
          </div>
          <button 
            onClick={() => {
              const today = getMalaysiaDate();
              setFilterStartDate(today);
              setFilterEndDate(today);
            }}
            className={`flex items-center justify-center p-1.5 sm:px-3 sm:py-1.5 rounded-lg transition-all duration-300 ${
              (filterStartDate !== getMalaysiaDate() || filterEndDate !== getMalaysiaDate())
                ? 'bg-rose-100 text-rose-600 hover:bg-rose-200 shadow-sm'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Reset to Today"
          >
            <RotateCcw size={16} strokeWidth={2.5} className={`transition-transform duration-300 ${(filterStartDate !== getMalaysiaDate() || filterEndDate !== getMalaysiaDate()) ? '-rotate-180' : ''}`} />
            <span className="hidden sm:inline ml-1.5 text-[13px] font-bold">Reset</span>
          </button>
        </div>
      </div>
      <div className="flex w-full space-x-1 sm:space-x-2 border-b border-gray-200 mb-4 px-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`whitespace-nowrap flex-1 sm:flex-none justify-center sm:justify-start px-2 sm:px-4 py-2 text-[13px] sm:text-[14px] font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all duration-200 ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <LayoutDashboard size={16} className="sm:w-[18px] sm:h-[18px]" />
          Executive Overview
        </button>
        <button
          onClick={() => setActiveTab('operational')}
          className={`whitespace-nowrap flex-1 sm:flex-none justify-center sm:justify-start px-2 sm:px-4 py-2 text-[13px] sm:text-[14px] font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all duration-200 ${
            activeTab === 'operational'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <ListTodo size={16} className="sm:w-[18px] sm:h-[18px]" />
          Action Center
        </button>
      </div>



      {activeTab === 'overview' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Top Tiles (Commented out per user request)
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        <StatCard layout={desktopLayout}
          title={`${prefix} Cash Sales`}
          value={formatCurrency(data.cashSalesToday)}
          desc={`${descPrefix} cash sales`}
          icon={Wallet}
          colorClass="bg-gradient-to-br from-emerald-400 to-emerald-600"
          reportUrl="/reports/sales"
        />
        <StatCard layout={desktopLayout}
          title={`${prefix} Credit Sales`}
          value={formatCurrency(data.creditSalesToday)}
          desc={`${descPrefix} credit sales`}
          icon={CreditCard}
          colorClass="bg-gradient-to-br from-teal-400 to-teal-600"
          reportUrl="/reports/sales"
        />
        <StatCard layout={desktopLayout}
          title={`${prefix} Cash Purchases`}
          value={formatCurrency(data.cashPurchasesToday)}
          desc={`${descPrefix} cash purchases`}
          icon={ShoppingCart}
          colorClass="bg-gradient-to-br from-blue-400 to-blue-600"
          reportUrl="/reports/purchase"
        />
        <StatCard layout={desktopLayout}
          title={`${prefix} Credit Purchases`}
          value={formatCurrency(data.creditPurchasesToday)}
          desc={`${descPrefix} credit purchases`}
          icon={CreditCard}
          colorClass="bg-gradient-to-br from-indigo-400 to-indigo-600"
          reportUrl="/reports/purchase"
        />
        <StatCard layout={desktopLayout}
          title={`Pending Payables`}
          value={formatCurrency(data.pendingPayables)}
          desc={`Supplier Outstanding`}
          icon={Landmark}
          colorClass="bg-gradient-to-br from-rose-400 to-rose-600"
          reportUrl="/reports/supplier-payments"
        />
        <StatCard layout={desktopLayout}
          title={`Pending Receivables`}
          value={formatCurrency(data.pendingReceivables)}
          desc={`Customer Outstanding / Due Collection`}
          icon={Users}
          colorClass="bg-gradient-to-br from-amber-400 to-amber-600"
          reportUrl="/reports/customer-receipts"
        />
        <StatCard layout={desktopLayout}
          title={`${prefix} Expenses`}
          value={formatCurrency(data.expensesToday)}
          desc="Operational costs"
          icon={TrendingDown}
          colorClass="bg-gradient-to-br from-purple-400 to-purple-600"
          reportUrl="/reports/expenses"
        />
        <StatCard layout={desktopLayout}
          title="Products"
          value={data.productsCount.toLocaleString()}
          desc="Total items"
          icon={Package}
          colorClass="bg-gradient-to-br from-fuchsia-400 to-fuchsia-600"
          reportUrl="/reports/stock"
        />
      </div>
      */}

      {/* Key Reports Section */}
      <div className="mb-4">
        <h2 className="text-[16px] font-bold text-black mb-3 flex items-center gap-2 px-1">
          <BarChart3 className="text-blue-500" size={18} /> Quick Reports
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 h-full">
          <StatCard layout={desktopLayout}
            title="Customer Outstanding"
            value={formatCurrency(data.pendingReceivables)}
            desc="Pending from customers"
            icon={Users}
            colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
            reportUrl="/reports/customer-receipts"
          />
          <StatCard layout={desktopLayout}
            title="Supplier Outstanding"
            value={formatCurrency(data.pendingPayables)}
            desc="Pending to suppliers"
            icon={Landmark}
            colorClass="bg-gradient-to-br from-rose-500 to-rose-600"
            reportUrl="/reports/supplier-payments"
          />
          <StatCard layout={desktopLayout}
            title="Expense Report"
            value={formatCurrency(data.expensesToday)}
            desc="Total operational costs"
            icon={TrendingDown}
            colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
            reportUrl="/reports/expenses"
          />
          <StatCard layout={desktopLayout}
            title="Due Collection Report"
            value={formatCurrency(data.collectionsInPeriod || 0)}
            desc="Collections received today"
            icon={Wallet}
            colorClass="bg-gradient-to-br from-emerald-500 to-emerald-600"
            reportUrl="/reports/customer-receipts"
          />
          <StatCard layout={desktopLayout}
            title="Sales Report"
            value={formatCurrency((Number(data.cashSalesToday) || 0) + (Number(data.creditSalesToday) || 0))}
            desc="Total sales today"
            icon={ShoppingCart}
            colorClass="bg-gradient-to-br from-indigo-500 to-indigo-600"
            reportUrl="/reports/sales"
          />
        </div>
        {renderOperationalGrid(true)}
      </div>
        </div>
      )}

      {activeTab === 'operational' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {renderOperationalGrid(false)}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
