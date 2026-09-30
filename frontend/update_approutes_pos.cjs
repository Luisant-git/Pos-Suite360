const fs = require('fs');
const file = 'D:/Pos-Nasa Fresh Mart/frontend/src/routes/AppRoutes.tsx';
let content = fs.readFileSync(file, 'utf8');

// Dashboard & QuickStart
content = content.replace(/<Route path="\/dashboard" element=\{<Dashboard \/>\} \/>/g, '<Route element={<ProtectedRoute requiredPerms="dashboard_access" />}><Route path="/dashboard" element={<Dashboard />} /></Route>');
content = content.replace(/<Route path="\/quick-start" element=\{<QuickStart \/>\} \/>/g, '<Route element={<ProtectedRoute requiredPerms="quick_start" />}><Route path="/quick-start" element={<QuickStart />} /></Route>');

// Purchase List
content = content.replace(/<Route element=\{<ProtectedRoute requiredPerms=\{.*\} \/>\}><Route path="\/purchase" element=\{<PurchaseList \/>\} \/><\/Route>/, '<Route element={<ProtectedRoute requiredPerms="purchase_list" />}><Route path="/purchase" element={<PurchaseList />} /></Route>');
// Purchase View
content = content.replace(/<Route element=\{<ProtectedRoute requiredPerms=\{.*\} \/>\}><Route path="\/purchase\/:id" element=\{<PurchaseView \/>\} \/><\/Route>/, '<Route element={<ProtectedRoute requiredPerms={[\'purchase_entry\', \'purchase_list\', \'purchase_return\', \'purchase_payments\']} />}><Route path="/purchase/:id" element={<PurchaseView />} /></Route>');

// Sales List
content = content.replace(/<Route element=\{<ProtectedRoute requiredPerms=\{.*\} \/>\}><Route path="\/sales" element=\{<SalesList \/>\} \/><\/Route>/, '<Route element={<ProtectedRoute requiredPerms="sales_list" />}><Route path="/sales" element={<SalesList />} /></Route>');

// Sales View and History
content = content.replace(/<Route element=\{<ProtectedRoute requiredPerms=\{.*\} \/>\}><Route path="\/sales\/:id" element=\{<SalesView \/>\} \/><\/Route>/, '<Route element={<ProtectedRoute requiredPerms={[\'sales_pos\', \'sales_list\', \'sales_return\', \'sales_receipts\']} />}><Route path="/sales/:id" element={<SalesView />} /></Route>');

// Menu Permissions
content = content.replace(/<Route path="\/master\/permissions" element=\{<MenuPermissions \/>\} \/>/, '</Route><Route element={<ProtectedRoute requiredPerms="master_permissions" />}><Route path="/master/permissions" element={<MenuPermissions />} /></Route>');
// Remove the extra closing route tag from users
content = content.replace(/<Route element=\{<ProtectedRoute requiredPerms="master_users" \/>\}>\s*<Route path="\/master\/users" element=\{<Users \/>\} \/>\s*<\/Route><Route element=\{<ProtectedRoute requiredPerms="master_permissions" \/>\}><Route path="\/master\/permissions" element=\{<MenuPermissions \/>\} \/><\/Route>\s*<\/Route>/, '<Route element={<ProtectedRoute requiredPerms="master_users" />}><Route path="/master/users" element={<Users />} /></Route><Route element={<ProtectedRoute requiredPerms="master_permissions" />}><Route path="/master/permissions" element={<MenuPermissions />} /></Route>');


// Reports
content = content.replace(/<Route element=\{<ProtectedRoute requiredPerms="reports_sales" \/>\}><Route path="\/reports\/sales" element=\{<SalesReport \/>\} \/><\/Route>/, '<Route element={<ProtectedRoute requiredPerms="reports_sales" />}><Route path="/reports/sales" element={<SalesReport />} /></Route>');
content = content.replace(/<Route element=\{<ProtectedRoute requiredPerms="reports_sales" \/>\}><Route path="\/reports\/sales-return" element=\{<SalesReturnReport \/>\} \/><\/Route>/, '<Route element={<ProtectedRoute requiredPerms="reports_sales_return" />}><Route path="/reports/sales-return" element={<SalesReturnReport />} /></Route>');
content = content.replace(/<Route element=\{<ProtectedRoute requiredPerms="reports_sales" \/>\}><Route path="\/reports\/product-wise-sales" element=\{<ProductWiseSalesReport \/>\} \/><\/Route>/, '<Route element={<ProtectedRoute requiredPerms="reports_product_wise_sales" />}><Route path="/reports/product-wise-sales" element={<ProductWiseSalesReport />} /></Route>');

content = content.replace(/<Route element=\{<ProtectedRoute requiredPerms="reports_purchase" \/>\}><Route path="\/reports\/purchase" element=\{<PurchaseReport \/>\} \/><\/Route>/, '<Route element={<ProtectedRoute requiredPerms="reports_purchase" />}><Route path="/reports/purchase" element={<PurchaseReport />} /></Route>');
content = content.replace(/<Route element=\{<ProtectedRoute requiredPerms="reports_purchase" \/>\}><Route path="\/reports\/purchase-return" element=\{<PurchaseReturnReport \/>\} \/><\/Route>/, '<Route element={<ProtectedRoute requiredPerms="reports_purchase_return" />}><Route path="/reports/purchase-return" element={<PurchaseReturnReport />} /></Route>');

content = content.replace(/<Route element=\{<ProtectedRoute requiredPerms="reports_financial" \/>\}><Route path="\/reports\/stock" element=\{<StockReport \/>\} \/><\/Route>/, '<Route element={<ProtectedRoute requiredPerms="reports_stock" />}><Route path="/reports/stock" element={<StockReport />} /></Route>');
content = content.replace(/<Route element=\{<ProtectedRoute requiredPerms="reports_financial" \/>\}><Route path="\/reports\/profit-ledger" element=\{<ProfitLossReport \/>\} \/><\/Route>/, '<Route element={<ProtectedRoute requiredPerms="reports_profit_ledger" />}><Route path="/reports/profit-ledger" element={<ProfitLossReport />} /></Route>');
content = content.replace(/<Route element=\{<ProtectedRoute requiredPerms="reports_financial" \/>\}><Route path="\/reports\/expenses" element=\{<ExpenseReport \/>\} \/><\/Route>/, '<Route element={<ProtectedRoute requiredPerms="reports_expense" />}><Route path="/reports/expenses" element={<ExpenseReport />} /></Route>');
content = content.replace(/<Route element=\{<ProtectedRoute requiredPerms="reports_financial" \/>\}><Route path="\/reports\/customer-receipts" element=\{<CustomerReceiptsReport \/>\} \/><\/Route>/, '<Route element={<ProtectedRoute requiredPerms="reports_customer_receipts" />}><Route path="/reports/customer-receipts" element={<CustomerReceiptsReport />} /></Route>');
content = content.replace(/<Route element=\{<ProtectedRoute requiredPerms="reports_financial" \/>\}><Route path="\/reports\/supplier-payments" element=\{<SupplierPaymentsReport \/>\} \/><\/Route>/, '<Route element={<ProtectedRoute requiredPerms="reports_supplier_payments" />}><Route path="/reports/supplier-payments" element={<SupplierPaymentsReport />} /></Route>');

fs.writeFileSync(file, content, 'utf8');
console.log('AppRoutes Pos updated');
