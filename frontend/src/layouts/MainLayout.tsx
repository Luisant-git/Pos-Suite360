import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, Settings as SettingsIcon, Zap, ArrowLeft } from 'lucide-react';

const NavItem = ({ title, icon, to }: { title: string, icon: string, to: string }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors ${isActive ? 'bg-[#1E3A8A] text-white border-b-2 border-white' : 'text-[#E0E7FF] hover:bg-[#1E40AF] hover:text-white border-b-2 border-transparent'}`}
  >
    <i className={`fa ${icon}`}></i>
    <span>{title}</span>
  </NavLink>
);

const NavDropdown = ({ title, icon, children, isActive }: { title: string, icon: string, children: React.ReactNode, isActive?: boolean }) => {
  return (
    <div className="relative group h-full flex items-center">
      <button className={`flex items-center gap-2 px-4 py-3 h-full text-sm font-bold transition-colors ${isActive ? 'bg-[#1E3A8A] text-white border-b-2 border-white' : 'text-[#E0E7FF] hover:bg-[#1E40AF] hover:text-white border-b-2 border-transparent'}`}>
        <i className={`fa ${icon}`}></i>
        <span>{title}</span>
        <ChevronDown size={14} className="ml-1 opacity-70" />
      </button>
      <div className="absolute left-0 top-full mt-0 w-64 bg-white border border-gray-200 shadow-2xl rounded-b-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden transform origin-top group-hover:scale-100 scale-95">
        <div className="py-2">
          {children}
        </div>
      </div>
    </div>
  );
};

const DropdownItem = ({ to, icon, title, isDanger = false, isWarning = false }: { to: string, icon: string, title: string, isDanger?: boolean, isWarning?: boolean }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 border-l-4 border-transparent'}`}
  >
    <div className={`w-6 flex justify-center ${isDanger ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-gray-400'}`}>
      <i className={`fa ${icon} text-base`}></i>
    </div>
    <span>{title}</span>
  </NavLink>
);

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const isMasterActive = location.pathname.startsWith('/master');
  const isSalesActive = location.pathname.startsWith('/sales');
  const isPurchaseActive = location.pathname.startsWith('/purchase');
  const isReportsActive = location.pathname.startsWith('/reports');

  const showBackButton = location.pathname !== '/dashboard' && location.pathname !== '/quick-start' && location.pathname !== '/';

  return (
    <div className="flex flex-col h-screen bg-[#F3F5F8] overflow-hidden font-sans text-[13px] print:h-auto print:overflow-visible print:bg-white">
      {/* Top Navigation Bar - Premium Blue */}
      <header className="bg-gradient-to-r from-[#1E40AF] to-[#2563EB] text-white shadow-lg z-30 print:hidden flex-shrink-0 border-b border-blue-800">
        <div className="flex items-center justify-between px-4 h-[60px]">
          {/* Logo & Main Nav */}
          <div className="flex items-center h-full">
            <Link to="/dashboard" className="flex items-center gap-2 sm:gap-3 mr-2 sm:mr-6 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all transform group-hover:-translate-y-0.5 shrink-0">
                <span className="text-[#2563EB] font-black text-sm sm:text-lg tracking-tighter">P<span className="text-amber-500">O</span>S</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-base sm:text-lg font-black tracking-wider whitespace-nowrap leading-tight">SUITE 360</span>
              </div>
            </Link>

            {/* Universal Back Button */}
            {showBackButton && (
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 px-3 py-1.5 mr-2 sm:mr-6 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-all font-bold text-[12px] sm:text-[13px] text-white shadow-sm shrink-0"
                title="Go Back"
              >
                <ArrowLeft size={16} /> <span className="hidden sm:inline">Back</span>
              </button>
            )}

            <nav className="hidden lg:flex h-full items-center">
              <NavItem to="/dashboard" icon="fa-dashboard" title="Dashboard" />
              
              <NavDropdown title="Sales" icon="fa-shopping-cart" isActive={isSalesActive}>
                <DropdownItem to="/sales/pos" icon="fa-th-large" title="Sales Entry (POS)" />
                <DropdownItem to="/sales/return" icon="fa-reply" title="Sales Return" isDanger />
                <div className="h-px bg-gray-100 my-1 mx-4"></div>
                <DropdownItem to="/sales/receipts" icon="fa-money" title="Customer Receipts" />
              </NavDropdown>

              <NavDropdown title="Purchases" icon="fa-truck" isActive={isPurchaseActive}>
                <DropdownItem to="/purchase/new" icon="fa-shopping-basket" title="Purchase Entry" />
                <DropdownItem to="/purchase/return" icon="fa-undo" title="Purchase Return" isWarning />
                <div className="h-px bg-gray-100 my-1 mx-4"></div>
                <DropdownItem to="/purchase/payments" icon="fa-credit-card" title="Supplier Payments" />
              </NavDropdown>

              <NavItem to="/expenses/new" icon="fa-calculator" title="Expenses" />

              <NavDropdown title="Master" icon="fa-database" isActive={isMasterActive}>
                <div className="px-4 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Inventory</div>
                <DropdownItem to="/master/products" icon="fa-cubes" title="Products" />
                <DropdownItem to="/master/brands" icon="fa-tags" title="Brands" />
                <DropdownItem to="/master/categories" icon="fa-sitemap" title="Categories" />
                <DropdownItem to="/master/units" icon="fa-balance-scale" title="Units" />
                
                <div className="h-px bg-gray-100 my-1 mx-4"></div>
                <div className="px-4 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">People</div>
                <DropdownItem to="/master/suppliers" icon="fa-building-o" title="Suppliers" />
                <DropdownItem to="/master/customers" icon="fa-users" title="Customers" />
                
                <div className="h-px bg-gray-100 my-1 mx-4"></div>
                <div className="px-4 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Settings</div>
                <DropdownItem to="/master/payment-modes" icon="fa-credit-card-alt" title="Payment Modes" />
                <DropdownItem to="/master/payment-types" icon="fa-money" title="Payment Types" />
                <DropdownItem to="/master/expense-categories" icon="fa-list-alt" title="Expense Categories" />
              </NavDropdown>

              <NavDropdown title="Reports" icon="fa-pie-chart" isActive={isReportsActive}>
                <div className="px-4 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Sales & Purchase</div>
                <DropdownItem to="/reports/sales" icon="fa-line-chart" title="Sales Report" />
                <DropdownItem to="/reports/sales-return" icon="fa-mail-reply" title="Sales Return Report" isDanger />
                <DropdownItem to="/reports/purchase" icon="fa-file-text-o" title="Purchase Report" />
                <DropdownItem to="/reports/purchase-return" icon="fa-mail-reply" title="Purchase Return Report" isWarning />
                
                <div className="h-px bg-gray-100 my-1 mx-4"></div>
                <div className="px-4 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Financial</div>
                <DropdownItem to="/reports/stock" icon="fa-cubes" title="Stock As On Date" />
                <DropdownItem to="/reports/profit-ledger" icon="fa-bar-chart" title="Profit / Ledger" />
              </NavDropdown>
            </nav>
          </div>

          {/* Right side Tools */}
          <div className="flex items-center gap-4 h-full">
            <Link 
              to="/quick-start"
              className="hidden xl:flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-5 py-2 rounded-full font-bold transition-all shadow-lg shadow-orange-500/40 text-[13px] transform hover:-translate-y-0.5 shrink-0"
            >
              <Zap size={16} fill="currentColor" /> Quick Start
            </Link>
            
            {!showBackButton && (
              <div className="hidden 2xl:flex items-center text-sm font-medium text-blue-50 bg-[#1E3A8A]/50 px-4 py-1.5 rounded-full border border-blue-400/30 backdrop-blur-sm shadow-inner shrink-0">
                <i className="fa fa-clock-o mr-2 text-blue-300"></i>
                {formattedDate}
              </div>
            )}

            {!showBackButton && <div className="h-8 w-px bg-blue-400/30 mx-2 hidden md:block"></div>}

            <div className="relative group h-full flex items-center shrink-0">
              <button className="flex items-center gap-3 hover:bg-[#1E3A8A] px-3 py-2 rounded-xl transition-all duration-200">
                <div className="w-8 h-8 bg-white text-[#2563EB] rounded-full flex items-center justify-center font-black text-sm shadow-md ring-2 ring-blue-400/50">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="font-bold text-sm leading-tight">{user?.name || 'User'}</span>
                  <span className="text-[10px] text-blue-200 font-medium">Admin</span>
                </div>
                <ChevronDown size={16} className="opacity-70 group-hover:rotate-180 transition-transform duration-300" />
              </button>
              
              <div className="absolute right-0 top-[90%] mt-2 w-56 bg-white border border-gray-100 shadow-2xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden transform origin-top-right group-hover:scale-100 scale-95">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <p className="text-base font-black text-gray-800">{user?.name || 'User'}</p>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mt-1">Administrator</p>
                </div>
                <div className="py-2 px-2">
                  <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-bold">
                    <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-500">
                      <SettingsIcon size={16} />
                    </div>
                    Settings
                  </Link>
                  <button 
                    onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-bold mt-1"
                  >
                    <div className="w-8 h-8 rounded-md bg-red-100 flex items-center justify-center text-red-500">
                      <LogOut size={16} />
                    </div>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative bg-[#F3F5F8] print:overflow-visible print:bg-white custom-scrollbar">
        <div className="max-w-full mx-auto w-full h-full flex flex-col p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;

