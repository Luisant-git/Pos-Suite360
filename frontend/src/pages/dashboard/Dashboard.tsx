import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  TrendingDown,
  Package,
  AlertTriangle,
  Receipt,
  RotateCcw,
  IndianRupee
} from 'lucide-react';
import api from '../../api';
import { useSettings } from '../../contexts/SettingsContext';

const StatCard = ({ title, value, icon: Icon, colorClass, desc }: any) => (
  <div className="bg-white border border-[#E6E9ED] shadow-sm p-4 relative flex items-center justify-between">
    <div>
      <h3 className="text-3xl font-bold text-gray-500">{value}</h3>
      <p className="text-[13px] text-[#1F2937] uppercase font-bold mt-1">{title}</p>
      {desc && <p className="text-[11px] text-[#adb2b5] mt-1">{desc}</p>}
    </div>
    <div className={`p-2 sm:p-2.5 rounded-lg ${colorClass} text-white flex-shrink-0 flex items-center justify-center`}>
      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
    </div>
  </div>
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
      <div className="bg-[#F7F7F7] min-h-[calc(100vh-100px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-t-[#3B82F6] border-[#E2E8F0] rounded-full animate-spin"></div>
          <p className="text-[14px] font-bold text-[#1F2937]">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = filterStartDate === todayStr && filterEndDate === todayStr;
  const prefix = isToday ? "Today's" : "Filtered";
  const descPrefix = isToday ? "Today's" : "Period";

  return (
    <div className="bg-[#F7F7F7] min-h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center mb-4 pt-2">
        <h1 className="text-[18px] font-bold text-[#1F2937]">Overview</h1>
        <div className="flex items-center gap-4 bg-white px-3 py-1.5 border border-[#E6E9ED] rounded-lg shadow-sm">
          <div className="flex items-center gap-2 border-r border-[#E6E9ED] pr-4">
            <label className="text-[12px] font-bold text-[#6B7280]">From:</label>
            <input 
              type="date" 
              value={filterStartDate} 
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="text-[13px] font-bold text-[#1F2937] outline-none bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2 pl-2 border-r border-[#E6E9ED] pr-4">
            <label className="text-[12px] font-bold text-[#6B7280]">To:</label>
            <input 
              type="date" 
              value={filterEndDate} 
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="text-[13px] font-bold text-[#1F2937] outline-none bg-transparent"
            />
          </div>
          <button 
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setFilterStartDate(today);
              setFilterEndDate(today);
            }}
            className="flex items-center gap-1 text-[12px] font-bold text-[#6B7280] hover:text-[#3B82F6] transition-colors pl-1"
            title="Reset to Today"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>
      {/* Top Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          title={`${prefix} Sales`}
          value={formatCurrency(data.salesToday)}
          desc={`${descPrefix} total sales`}
          icon={IndianRupee}
          colorClass="bg-[#26B99A]"
        />
        <StatCard
          title={`${prefix} Purchases`}
          value={formatCurrency(data.purchasesToday)}
          desc={`${descPrefix} total purchases`}
          icon={ShoppingCart}
          colorClass="bg-[#3B82F6]"
        />
        <StatCard
          title={`${prefix} Expenses`}
          value={formatCurrency(data.expensesToday)}
          desc="Operational costs"
          icon={TrendingDown}
          colorClass="bg-[#E11D48]"
        />
        <StatCard
          title="Products"
          value={data.productsCount.toLocaleString()}
          desc="Total items"
          icon={Package}
          colorClass="bg-[#9B59B6]"
        />
        <StatCard
          title="Low Stock"
          value={data.lowStockCount.toLocaleString()}
          desc="Items at or below min qty"
          icon={AlertTriangle}
          colorClass="bg-[#F39C12]"
        />
        <StatCard
          title={`${prefix} Bills`}
          value={data.billsToday.toLocaleString()}
          desc={`Completed ${isToday ? 'today' : 'in period'}`}
          icon={Receipt}
          colorClass="bg-[#34495E]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview
        <div className="lg:col-span-2 bg-white border border-[#E6E9ED] shadow-sm">
          <div className="border-b border-[#E6E9ED] px-4 py-3 flex justify-between items-center bg-white">
            <h2 className="text-[15px] font-bold text-[#1F2937]">Sales Overview <small className="font-normal">Current Month</small></h2>
          </div>
          <div className="p-4 h-[350px] bg-white">
            {data.chartData && data.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => formatCurrency(val)} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">No sales data this month</div>
            )}
          </div>
        </div>
        */}

        {/* Low Stock Products */}
        <div className="bg-white border border-[#E6E9ED] shadow-sm">
          <div className="border-b border-[#E6E9ED] px-4 py-3 flex justify-between items-center bg-white">
            <h2 className="text-[15px] font-bold text-[#1F2937]">Low Stock Products</h2>
          </div>
          <div className="p-0 h-[350px] overflow-y-auto custom-scrollbar">
            {data.lowStockProducts && data.lowStockProducts.length > 0 ? (
              <ul className="divide-y divide-[#E6E9ED]">
                {data.lowStockProducts.map((product: any, idx: number) => (
                  <li key={idx} className="p-4 flex items-center justify-between hover:bg-[#E5E7EB] font-bold text-[13px] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#E6E9ED] rounded flex items-center justify-center text-[#1F2937]">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-[#1F2937]">{product.name}</p>
                        <p className="text-[12px] text-[#adb2b5]">Min Stock: {product.minStock}</p>
                      </div>
                    </div>
                    <div className="font-bold text-[#EF4444]">
                      {product.currentStock} in stock
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 font-bold p-6 text-center">No low stock products</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
