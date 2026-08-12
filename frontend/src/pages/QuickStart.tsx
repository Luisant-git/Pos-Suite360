import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  TrendingDown,
  Package,
  Receipt,
  RotateCcw,
  Database,
  Tag,
  List,
  Truck,
  Users,
  Scale,
  CreditCard,
  ListOrdered,
  BarChart2,
  FileText,
  ArrowLeft,
  Tags
} from 'lucide-react';

const menuData = [
  {
    title: 'Master',
    icon: Database,
    color: 'text-purple-500',
    hoverBorder: 'hover:border-purple-500',
    items: [
      { name: 'Products', path: '/master/products', icon: Package },
      { name: 'Brands', path: '/master/brands', icon: Tag },
      { name: 'Categories', path: '/master/categories', icon: List },
      { name: 'Suppliers', path: '/master/suppliers', icon: Truck },
      { name: 'Customers', path: '/master/customers', icon: Users },
      { name: 'Units', path: '/master/units', icon: Scale },
      { name: 'Payment Modes', path: '/master/payment-modes', icon: CreditCard },
      { name: 'Expense Categories', path: '/master/expense-categories', icon: Tags },
      // { name: 'Users', path: '/master/users', icon: UserCog },
    ]
  },
  {
    title: 'Purchase',
    icon: ShoppingCart,
    color: 'text-emerald-500',
    hoverBorder: 'hover:border-emerald-500',
    items: [
      { name: 'Purchase List', path: '/purchase', icon: ListOrdered },
      { name: 'Purchase Entry', path: '/purchase/new', icon: ShoppingCart },
      { name: 'Supplier Payments', path: '/purchase/payments', icon: CreditCard },
      { name: 'Purchase Return', path: '/purchase/return', icon: RotateCcw },
    ]
  },
  {
    title: 'Sales',
    icon: Receipt,
    color: 'text-blue-500',
    hoverBorder: 'hover:border-blue-500',
    items: [
      { name: 'Sales List', path: '/sales', icon: ListOrdered },
      { name: 'Sales Entry (POS)', path: '/sales/pos', icon: Receipt },
      // { name: 'Sales History', path: '/sales/history', icon: History },
      { name: 'Customer Receipts', path: '/sales/receipts', icon: CreditCard },
      { name: 'Sales Return', path: '/sales/return', icon: RotateCcw },
    ]
  },
  /*
  {
    title: 'Inventory',
    icon: Boxes,
    color: 'text-orange-500',
    hoverBorder: 'hover:border-orange-500',
    items: [
      { name: 'Stock', path: '/inventory/stock', icon: Boxes },
      { name: 'Stock Ledger', path: '/inventory/ledger', icon: ClipboardList },
      { name: 'Stock Adjustment', path: '/inventory/adjustment', icon: Sliders },
    ]
  },
  */
  {
    title: 'Expenses',
    icon: TrendingDown,
    color: 'text-red-500',
    hoverBorder: 'hover:border-red-500',
    items: [
      // { name: 'Expense List', path: '/expenses', icon: ListOrdered },
      { name: 'Expense Entry', path: '/expenses/new', icon: TrendingDown },
    ]
  },
  {
    title: 'Reports',
    icon: BarChart2,
    color: 'text-teal-500',
    hoverBorder: 'hover:border-teal-500',
    items: [
      { name: 'Purchase Report', path: '/reports/purchase', icon: FileText },
      { name: 'Purchase Return Report', path: '/reports/purchase-return', icon: FileText },
      { name: 'Sales Report', path: '/reports/sales', icon: FileText },
      { name: 'Sales Return Report', path: '/reports/sales-return', icon: FileText },
      { name: 'Stock As On Date', path: '/reports/stock', icon: FileText },
      { name: 'Profit / Ledger', path: '/reports/profit-ledger', icon: FileText },
      // { name: 'Top Products', path: '/reports/top-products', icon: Star },
      // { name: 'Daily Sales', path: '/reports/daily-sales', icon: Calendar },
    ]
  },
  /*
  {
    title: 'Settings',
    icon: Settings,
    color: 'text-gray-500',
    hoverBorder: 'hover:border-gray-500',
    items: [
      { name: 'App Settings', path: '/settings', icon: Settings }
    ]
  }
  */
];

const QuickStart = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const currentCategoryData = menuData.find(cat => cat.title === activeCategory);

  return (
    <div className="bg-[#F7F7F7] min-h-[calc(100vh-100px)] p-6">
      <div className="bg-white border border-[#E6E9ED] shadow-sm flex flex-col min-h-[400px]">
        <div className="border-b border-[#E6E9ED] px-4 py-3 bg-white shrink-0 flex items-center gap-4">
          {activeCategory && (
            <button 
              onClick={() => setActiveCategory(null)}
              className="text-[#6B7280] hover:text-[#1F2937] transition-colors p-1"
              title="Back to Categories"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-[18px] font-bold text-[#1F2937]">
            {activeCategory ? `Quick Links - ${activeCategory}` : 'Quick Links - App Launcher'}
          </h2>
        </div>
        
        <div className="p-8 flex-1 bg-[#F9FAFB]">
          {!activeCategory ? (
            // Show Main Categories
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 content-start">
              {menuData.map((category) => (
                <button 
                  key={category.title}
                  onClick={() => setActiveCategory(category.title)} 
                  className={`flex flex-col items-center justify-center p-8 bg-white border-2 border-[#F3F4F6] shadow-sm hover:shadow-lg rounded-xl transition-all group ${category.hoverBorder}`}
                >
                  <category.icon size={48} className={`mb-4 transition-transform group-hover:scale-110 ${category.color}`} />
                  <span className="text-[15px] font-bold text-[#4B5563] group-hover:text-[#1F2937]">{category.title}</span>
                  <span className="text-[11px] font-bold text-gray-400 mt-2">{category.items.length} items</span>
                </button>
              ))}
            </div>
          ) : (
            // Show Sub Items for Selected Category
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 content-start animate-in fade-in zoom-in-95 duration-200">
              {currentCategoryData?.items.map((item) => (
                <button 
                  key={item.name}
                  onClick={() => navigate(item.path)} 
                  className={`flex flex-col items-center justify-center p-6 bg-white border border-[#E5E7EB] shadow-sm rounded-lg transition-all text-[#4B5563] ${currentCategoryData.hoverBorder} hover:shadow-md group`}
                >
                  <item.icon size={36} className={`mb-3 transition-colors group-hover:${currentCategoryData.color.replace('text-', 'text-')}`} />
                  <span className="text-[14px] font-bold group-hover:text-[#1F2937] leading-tight text-center">{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickStart;
