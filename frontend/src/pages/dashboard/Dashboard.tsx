import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  TrendingDown,
  Package,
  RotateCcw,
  CreditCard,
  Wallet,
  Landmark,
  Users,
  MonitorPlay,
  Truck,
  FileText,
  BarChart3,
  Zap
} from 'lucide-react';
import api from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';

const StatCard = ({ title, value, icon: Icon, colorClass, desc }: any) => (
  <div className="bg-white border border-[#E6E9ED] shadow-sm p-5 relative flex items-center justify-between rounded-xl hover:shadow-md transition-shadow">
    <div>
      <h3 className="text-3xl font-black text-gray-700">{value}</h3>
      <p className="text-[14px] text-[#1F2937] font-bold mt-1 uppercase tracking-wide">{title}</p>
      {desc && <p className="text-[12px] text-gray-400 font-medium mt-1">{desc}</p>}
    </div>
    <div className={`p-4 rounded-xl ${colorClass} text-white flex-shrink-0 flex items-center justify-center shadow-inner`}>
      <Icon className="w-8 h-8" />
    </div>
  </div>
);

const QuickAction = ({ title, icon: Icon, to, colorClass, desc }: any) => (
  <Link to={to} className={`group bg-white border border-gray-200 shadow-sm p-6 rounded-xl flex flex-col items-center justify-center gap-3 hover:shadow-lg transition-all transform hover:-translate-y-1 ${colorClass}`}>
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gray-50 group-hover:bg-white group-hover:scale-110 transition-all shadow-sm">
      <Icon className="w-8 h-8" />
    </div>
    <div className="text-center">
      <h3 className="text-[16px] font-black text-gray-800">{title}</h3>
      <p className="text-[12px] text-gray-500 font-medium mt-1">{desc}</p>
    </div>
  </Link>
);

const Dashboard = () => {
  const { formatCurrency } = useSettings();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStartDate, setFilterStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterEndDate, setFilterEndDate] = useState(new Date().toISOString().split('T')[0]);

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
          <p className="text-[15px] font-bold text-gray-600 tracking-wide">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = filterStartDate === todayStr && filterEndDate === todayStr;
  const prefix = isToday ? "Today's" : "Filtered";
  const descPrefix = isToday ? "Today's" : "Period";

  return (
    <div className="bg-[#F3F5F8] min-h-full pb-8">
      {/* Quick Launchpad for POS */}
      <div className="mb-8">
        <h2 className="text-[20px] font-black text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="text-amber-500" /> Quick Launchpad
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <QuickAction 
            title="Sales Entry" 
            desc="Open POS Terminal" 
            icon={MonitorPlay} 
            to="/sales/pos" 
            colorClass="hover:border-blue-500 [&>div]:text-blue-600 [&>div]:bg-blue-50"
          />
          <QuickAction 
            title="Customer Receipts" 
            desc="Collect Payments" 
            icon={Wallet} 
            to="/sales/receipts" 
            colorClass="hover:border-emerald-500 [&>div]:text-emerald-600 [&>div]:bg-emerald-50"
          />
          <QuickAction 
            title="Purchase Entry" 
            desc="Record Inwards" 
            icon={Truck} 
            to="/purchase/new" 
            colorClass="hover:border-purple-500 [&>div]:text-purple-600 [&>div]:bg-purple-50"
          />
          <QuickAction 
            title="Supplier Payments" 
            desc="Pay Vendors" 
            icon={CreditCard} 
            to="/purchase/payments" 
            colorClass="hover:border-rose-500 [&>div]:text-rose-600 [&>div]:bg-rose-50"
          />
          <QuickAction 
            title="Products" 
            desc="Manage Inventory" 
            icon={Package} 
            to="/master/products" 
            colorClass="hover:border-amber-500 [&>div]:text-amber-600 [&>div]:bg-amber-50"
          />
          <QuickAction 
            title="Sales Report" 
            desc="View Analytics" 
            icon={BarChart3} 
            to="/reports/sales" 
            colorClass="hover:border-indigo-500 [&>div]:text-indigo-600 [&>div]:bg-indigo-50"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-[20px] font-black text-gray-800">Financial Overview</h1>
        <div className="flex flex-wrap items-center gap-3 bg-white px-4 py-2 border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
            <label className="text-[13px] font-bold text-gray-500">From:</label>
            <input 
              type="date" 
              value={filterStartDate} 
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="text-[14px] font-bold text-gray-800 outline-none bg-transparent cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2 sm:pl-2 sm:border-r border-gray-200 pr-4">
            <label className="text-[13px] font-bold text-gray-500">To:</label>
            <input 
              type="date" 
              value={filterEndDate} 
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="text-[14px] font-bold text-gray-800 outline-none bg-transparent cursor-pointer"
            />
          </div>
          <button 
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setFilterStartDate(today);
              setFilterEndDate(today);
            }}
            className="flex items-center gap-1.5 text-[13px] font-bold text-gray-500 hover:text-blue-600 transition-colors sm:pl-2"
            title="Reset to Today"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>
      
      {/* Top Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={`${prefix} Cash Sales`}
          value={formatCurrency(data.cashSalesToday)}
          desc={`${descPrefix} cash sales`}
          icon={Wallet}
          colorClass="bg-gradient-to-br from-emerald-400 to-emerald-600"
        />
        <StatCard
          title={`${prefix} Credit Sales`}
          value={formatCurrency(data.creditSalesToday)}
          desc={`${descPrefix} credit sales`}
          icon={CreditCard}
          colorClass="bg-gradient-to-br from-teal-400 to-teal-600"
        />
        <StatCard
          title={`${prefix} Cash Purchases`}
          value={formatCurrency(data.cashPurchasesToday)}
          desc={`${descPrefix} cash purchases`}
          icon={ShoppingCart}
          colorClass="bg-gradient-to-br from-blue-400 to-blue-600"
        />
        <StatCard
          title={`${prefix} Credit Purchases`}
          value={formatCurrency(data.creditPurchasesToday)}
          desc={`${descPrefix} credit purchases`}
          icon={CreditCard}
          colorClass="bg-gradient-to-br from-indigo-400 to-indigo-600"
        />
        <StatCard
          title={`Pending Payables`}
          value={formatCurrency(data.pendingPayables)}
          desc={`Amount owed to suppliers`}
          icon={Landmark}
          colorClass="bg-gradient-to-br from-rose-400 to-rose-600"
        />
        <StatCard
          title={`Pending Receivables`}
          value={formatCurrency(data.pendingReceivables)}
          desc={`Amount owed by customers`}
          icon={Users}
          colorClass="bg-gradient-to-br from-amber-400 to-amber-600"
        />
        <StatCard
          title={`${prefix} Expenses`}
          value={formatCurrency(data.expensesToday)}
          desc="Operational costs"
          icon={TrendingDown}
          colorClass="bg-gradient-to-br from-purple-400 to-purple-600"
        />
        <StatCard
          title="Products"
          value={data.productsCount.toLocaleString()}
          desc="Total items"
          icon={Package}
          colorClass="bg-gradient-to-br from-fuchsia-400 to-fuchsia-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Products */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden lg:col-span-3 xl:col-span-1">
          <div className="border-b border-gray-100 px-5 py-4 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-[16px] font-black text-gray-800 flex items-center gap-2">
              <Package size={18} className="text-rose-500" /> Low Stock Alerts
            </h2>
          </div>
          <div className="p-0 h-[350px] overflow-y-auto custom-scrollbar bg-white">
            {data.lowStockProducts && data.lowStockProducts.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {data.lowStockProducts.map((product: any, idx: number) => (
                  <li key={idx} className="p-4 flex items-center justify-between hover:bg-rose-50/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                        <Package size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-[14px]">{product.name}</p>
                        <p className="text-[12px] text-gray-500 font-medium mt-0.5">Min Stock: {product.minStock}</p>
                      </div>
                    </div>
                    <div className="font-black text-rose-500 bg-rose-100 px-3 py-1.5 rounded-lg text-[13px]">
                      {product.currentStock} left
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center gap-3">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                  <Package size={32} className="text-gray-300" />
                </div>
                <p className="font-bold text-[14px]">All stock levels are optimal</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
