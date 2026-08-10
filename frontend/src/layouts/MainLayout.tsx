import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'Pro X Admin' });
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }

    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = `${currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} ${currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;

  return (
    <div className="flex h-screen bg-[#F7F7F7] overflow-hidden font-sans text-[13px] print:h-auto print:overflow-visible print:bg-white">
      {/* Sidebar - Classic Dark Charcoal */}
      <aside className={`bg-[#111827] text-[#E7E7E7] flex flex-col transition-all duration-300 z-20 overflow-hidden print:hidden ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-[50px] min-h-[50px] flex items-center justify-center bg-[#3B82F6] text-white">
          <span className="text-lg font-bold tracking-wide whitespace-nowrap">
            {isSidebarOpen ? 'POS Suite 360' : 'POS'}
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 custom-scrollbar">
          {/* User Info in Sidebar */}
          <div className="flex items-center px-4 py-4 border-b border-[#111827]/50 mb-2">
            <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold mr-3 flex-shrink-0 ml-1">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className={`whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-[#E7E7E7] text-sm">Welcome,</p>
              <p className="text-white font-medium">{user?.name || 'User'}</p>
            </div>
          </div>

          <nav className="space-y-0 pb-8">
            <div className={`px-4 py-2 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              <h3 className="text-xs uppercase text-[#E7E7E7] font-bold whitespace-nowrap">General</h3>
            </div>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-5 py-3 transition-colors border-r-4 whitespace-nowrap ${
                  isActive 
                    ? 'bg-[#1F2937] border-[#1ABB9C] text-white' 
                    : 'border-transparent hover:bg-[#1F2937] font-bold hover:text-white'
                }`
              }
              title={!isSidebarOpen ? "Dashboard" : undefined}
            >
              <i className="fa fa-dashboard text-xl w-8 text-center flex-shrink-0"></i>
              <span className={`font-bold transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Dashboard</span>
            </NavLink>

            {/* Masters */}
            <div className={`px-4 pt-4 py-2 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              <h3 className="text-xs uppercase text-[#E7E7E7] font-bold whitespace-nowrap">Master</h3>
            </div>
            
            <NavLink to="/master/products" title={!isSidebarOpen ? "Products" : undefined} className={({ isActive }) => `flex items-center gap-3 px-5 py-3 transition-colors border-r-4 whitespace-nowrap ${isActive ? 'bg-[#1F2937] border-[#1ABB9C] text-white' : 'border-transparent hover:bg-[#1F2937] font-bold hover:text-white'}`}>
              <i className="fa fa-cubes text-xl w-8 text-center flex-shrink-0"></i>
              <span className={`font-bold transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Products</span>
            </NavLink>
            <NavLink to="/master/brands" title={!isSidebarOpen ? "Brands" : undefined} className={({ isActive }) => `flex items-center gap-3 px-5 py-3 transition-colors border-r-4 whitespace-nowrap ${isActive ? 'bg-[#1F2937] border-[#1ABB9C] text-white' : 'border-transparent hover:bg-[#1F2937] font-bold hover:text-white'}`}>
              <i className="fa fa-tags text-xl w-8 text-center flex-shrink-0"></i>
              <span className={`font-bold transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Brands</span>
            </NavLink>
            <NavLink to="/master/categories" title={!isSidebarOpen ? "Categories" : undefined} className={({ isActive }) => `flex items-center gap-3 px-5 py-3 transition-colors border-r-4 whitespace-nowrap ${isActive ? 'bg-[#1F2937] border-[#1ABB9C] text-white' : 'border-transparent hover:bg-[#1F2937] font-bold hover:text-white'}`}>
              <i className="fa fa-sitemap text-xl w-8 text-center flex-shrink-0"></i>
              <span className={`font-bold transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Categories</span>
            </NavLink>
            <NavLink to="/master/suppliers" title={!isSidebarOpen ? "Suppliers" : undefined} className={({ isActive }) => `flex items-center gap-3 px-5 py-3 transition-colors border-r-4 whitespace-nowrap ${isActive ? 'bg-[#1F2937] border-[#1ABB9C] text-white' : 'border-transparent hover:bg-[#1F2937] font-bold hover:text-white'}`}>
              <i className="fa fa-building-o text-xl w-8 text-center flex-shrink-0"></i>
              <span className={`font-bold transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Suppliers</span>
            </NavLink>
            <NavLink to="/master/customers" title={!isSidebarOpen ? "Customers" : undefined} className={({ isActive }) => `flex items-center gap-3 px-5 py-3 transition-colors border-r-4 whitespace-nowrap ${isActive ? 'bg-[#1F2937] border-[#1ABB9C] text-white' : 'border-transparent hover:bg-[#1F2937] font-bold hover:text-white'}`}>
              <i className="fa fa-users text-xl w-8 text-center flex-shrink-0"></i>
              <span className={`font-bold transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Customers</span>
            </NavLink>
            <NavLink to="/master/units" title={!isSidebarOpen ? "Units" : undefined} className={({ isActive }) => `flex items-center gap-3 px-5 py-3 transition-colors border-r-4 whitespace-nowrap ${isActive ? 'bg-[#1F2937] border-[#1ABB9C] text-white' : 'border-transparent hover:bg-[#1F2937] font-bold hover:text-white'}`}>
              <i className="fa fa-balance-scale text-xl w-8 text-center flex-shrink-0"></i>
              <span className={`font-bold transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Units</span>
            </NavLink>
            <NavLink to="/master/payment-modes" title={!isSidebarOpen ? "Payment Modes" : undefined} className={({ isActive }) => `flex items-center gap-3 px-5 py-3 transition-colors border-r-4 whitespace-nowrap ${isActive ? 'bg-[#1F2937] border-[#1ABB9C] text-white' : 'border-transparent hover:bg-[#1F2937] font-bold hover:text-white'}`}>
              <i className="fa fa-credit-card text-xl w-8 text-center flex-shrink-0"></i>
              <span className={`font-bold transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Payment Modes</span>
            </NavLink>

            {/* Sales & Purchase */}
            <div className={`px-4 pt-4 py-2 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              <h3 className="text-xs uppercase text-[#E7E7E7] font-bold whitespace-nowrap">Transactions</h3>
            </div>
            <NavLink to="/purchase/new" title={!isSidebarOpen ? "Purchase Entry" : undefined} className={({ isActive }) => `flex items-center gap-3 px-5 py-3 transition-colors border-r-4 whitespace-nowrap ${isActive ? 'bg-[#1F2937] border-[#1ABB9C] text-white' : 'border-transparent hover:bg-[#1F2937] font-bold hover:text-white'}`}>
              <i className="fa fa-truck text-xl w-8 text-center flex-shrink-0"></i>
              <span className={`font-bold transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Purchase Entry</span>
            </NavLink>
            <NavLink to="/purchase/payments" title={!isSidebarOpen ? "Supplier Payments" : undefined} className={({ isActive }) => `flex items-center gap-3 px-5 py-3 transition-colors border-r-4 whitespace-nowrap ${isActive ? 'bg-[#1F2937] border-[#1ABB9C] text-white' : 'border-transparent hover:bg-[#1F2937] font-bold hover:text-white'}`}>
              <i className="fa fa-credit-card text-xl w-8 text-center flex-shrink-0"></i>
              <span className={`font-bold transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Supplier Payments</span>
            </NavLink>
            <NavLink to="/sales/pos" title={!isSidebarOpen ? "Sales Entry" : undefined} className={({ isActive }) => `flex items-center gap-3 px-5 py-3 transition-colors border-r-4 whitespace-nowrap ${isActive ? 'bg-[#1F2937] border-[#1ABB9C] text-white' : 'border-transparent hover:bg-[#1F2937] font-bold hover:text-white'}`}>
              <i className="fa fa-shopping-cart text-xl w-8 text-center flex-shrink-0"></i>
              <span className={`font-bold transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Sales Entry</span>
            </NavLink>
            <NavLink to="/sales/receipts" title={!isSidebarOpen ? "Customer Receipts" : undefined} className={({ isActive }) => `flex items-center gap-3 px-5 py-3 transition-colors border-r-4 whitespace-nowrap ${isActive ? 'bg-[#1F2937] border-[#1ABB9C] text-white' : 'border-transparent hover:bg-[#1F2937] font-bold hover:text-white'}`}>
              <i className="fa fa-money text-xl w-8 text-center flex-shrink-0"></i>
              <span className={`font-bold transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Customer Receipts</span>
            </NavLink>

            {/* Reports */}
            <div className={`px-4 pt-4 py-2 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              <h3 className="text-xs uppercase text-[#E7E7E7] font-bold whitespace-nowrap">Reports</h3>
            </div>
            <NavLink to="/reports/purchase" title={!isSidebarOpen ? "Purchase Report" : undefined} className={({ isActive }) => `flex items-center gap-3 px-5 py-3 transition-colors border-r-4 whitespace-nowrap ${isActive ? 'bg-[#1F2937] border-[#1ABB9C] text-white' : 'border-transparent hover:bg-[#1F2937] font-bold hover:text-white'}`}>
              <i className="fa fa-file-text-o text-xl w-8 text-center flex-shrink-0"></i>
              <span className={`font-bold transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Purchase Report</span>
            </NavLink>
            <NavLink to="/reports/sales" title={!isSidebarOpen ? "Sales Report" : undefined} className={({ isActive }) => `flex items-center gap-3 px-5 py-3 transition-colors border-r-4 whitespace-nowrap ${isActive ? 'bg-[#1F2937] border-[#1ABB9C] text-white' : 'border-transparent hover:bg-[#1F2937] font-bold hover:text-white'}`}>
              <i className="fa fa-line-chart text-xl w-8 text-center flex-shrink-0"></i>
              <span className={`font-bold transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Sales Report</span>
            </NavLink>
            <NavLink to="/reports/stock" title={!isSidebarOpen ? "Stock As On Date" : undefined} className={({ isActive }) => `flex items-center gap-3 px-5 py-3 transition-colors border-r-4 whitespace-nowrap ${isActive ? 'bg-[#1F2937] border-[#1ABB9C] text-white' : 'border-transparent hover:bg-[#1F2937] font-bold hover:text-white'}`}>
              <i className="fa fa-pie-chart text-xl w-8 text-center flex-shrink-0"></i>
              <span className={`font-bold transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Stock As On Date</span>
            </NavLink>
          </nav>
        </div>
        
        <div className="flex bg-[#1F2937] text-[#E7E7E7]">
          <Link to="/settings" className="flex-1 py-3 flex justify-center hover:bg-[#111827] font-bold transition-colors text-xl" title="Settings">
            <i className="fa fa-cog"></i>
          </Link>
          <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="flex-1 py-3 flex justify-center hover:bg-[#111827] font-bold transition-colors text-xl" title="Logout">
            <i className="fa fa-sign-out"></i>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#F7F7F7] print:overflow-visible print:bg-white">
        {/* Header - Solid Blue */}
        <header className="h-[50px] bg-[#3B82F6] text-white flex items-center justify-between px-4 z-10 shadow print:hidden">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[#2563EB] font-bold rounded text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden sm:inline-block font-medium">{formattedDate}</span>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-[#2563EB] font-bold py-1 px-3 rounded transition-colors h-[40px]">
              <div className="w-7 h-7 bg-slate-200 text-[#3B82F6] rounded-full flex items-center justify-center font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="font-bold">{user?.name || 'User'}</span>
              <i className="fa fa-angle-down ml-1 opacity-70"></i>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 relative print:overflow-visible print:p-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;

