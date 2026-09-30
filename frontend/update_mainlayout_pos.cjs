const fs = require('fs');
const file = 'D:/Pos-Nasa Fresh Mart/frontend/src/layouts/MainLayout.tsx';
let content = fs.readFileSync(file, 'utf8');

// Dashboard (2 places)
content = content.replace(/<NavItem to="\/dashboard" icon="fa-dashboard" title="Dashboard" \/>/g, '{hasPerm(\'dashboard_access\') && <NavItem to="/dashboard" icon="fa-dashboard" title="Dashboard" />}');

// Quick Start (1 place)
content = content.replace(/<Link \n\s*to="\/quick-start"([^]*?)<\/Link>/, '{hasPerm(\'quick_start\') && (\n            <Link \n              to="/quick-start"</Link>\n            )}');

// Purchase List (2 places)
content = content.replace(/\{hasPerm\('purchase_entry'\) && <DropdownItem to="\/purchase" icon="fa-list-alt" title="Purchase List" \/>\}/g, '{hasPerm(\'purchase_list\') && <DropdownItem to="/purchase" icon="fa-list-alt" title="Purchase List" />}');
content = content.replace(/\{hasPerm\('purchase_entry'\) && <MobileDropdownItem to="\/purchase" icon="fa-list-alt" title="Purchase List" \/>\}/g, '{hasPerm(\'purchase_list\') && <MobileDropdownItem to="/purchase" icon="fa-list-alt" title="Purchase List" />}');

// Sales List (2 places)
content = content.replace(/\{hasPerm\('sales_pos'\) && <DropdownItem to="\/sales" icon="fa-list-alt" title="Sales List" \/>\}/g, '{hasPerm(\'sales_list\') && <DropdownItem to="/sales" icon="fa-list-alt" title="Sales List" />}');
content = content.replace(/\{hasPerm\('sales_pos'\) && <MobileDropdownItem to="\/sales" icon="fa-list-alt" title="Sales List" \/>\}/g, '{hasPerm(\'sales_list\') && <MobileDropdownItem to="/sales" icon="fa-list-alt" title="Sales List" />}');

// Purchase permissions array
content = content.replace(/hasAnyPerm\(\['purchase_entry', 'purchase_return', 'purchase_payments'\]\)/g, 'hasAnyPerm([\'purchase_entry\', \'purchase_list\', \'purchase_return\', \'purchase_payments\'])');

// Sales permissions array
content = content.replace(/hasAnyPerm\(\['sales_pos', 'sales_return', 'sales_receipts'\]\)/g, 'hasAnyPerm([\'sales_pos\', \'sales_list\', \'sales_return\', \'sales_receipts\'])');

// Reports permissions array
content = content.replace(/hasAnyPerm\(\['reports_sales', 'reports_purchase', 'reports_financial'\]\)/g, 'hasAnyPerm([\'reports_sales\', \'reports_purchase\', \'reports_financial\', \'reports_purchase_return\', \'reports_sales_return\', \'reports_product_wise_sales\', \'reports_stock\', \'reports_profit_ledger\', \'reports_expense\', \'reports_customer_receipts\', \'reports_supplier_payments\'])');

// Reports individual (Mobile)
content = content.replace(/hasPerm\('reports_sales'\) && <MobileDropdownItem to="\/reports\/sales-return"/g, 'hasPerm(\'reports_sales_return\') && <MobileDropdownItem to="/reports/sales-return"');
content = content.replace(/hasPerm\('reports_sales'\) && <MobileDropdownItem to="\/reports\/product-wise-sales"/g, 'hasPerm(\'reports_product_wise_sales\') && <MobileDropdownItem to="/reports/product-wise-sales"');
content = content.replace(/hasPerm\('reports_purchase'\) && <MobileDropdownItem to="\/reports\/purchase-return"/g, 'hasPerm(\'reports_purchase_return\') && <MobileDropdownItem to="/reports/purchase-return"');
content = content.replace(/hasPerm\('reports_financial'\) && <MobileDropdownItem to="\/reports\/stock"/g, 'hasPerm(\'reports_stock\') && <MobileDropdownItem to="/reports/stock"');
content = content.replace(/hasPerm\('reports_financial'\) && <MobileDropdownItem to="\/reports\/profit-ledger"/g, 'hasPerm(\'reports_profit_ledger\') && <MobileDropdownItem to="/reports/profit-ledger"');
content = content.replace(/hasPerm\('reports_financial'\) && <MobileDropdownItem to="\/reports\/expenses"/g, 'hasPerm(\'reports_expense\') && <MobileDropdownItem to="/reports/expenses"');
content = content.replace(/hasPerm\('reports_financial'\) && <MobileDropdownItem to="\/reports\/customer-receipts"/g, 'hasPerm(\'reports_customer_receipts\') && <MobileDropdownItem to="/reports/customer-receipts"');
content = content.replace(/hasPerm\('reports_financial'\) && <MobileDropdownItem to="\/reports\/supplier-payments"/g, 'hasPerm(\'reports_supplier_payments\') && <MobileDropdownItem to="/reports/supplier-payments"');

// Reports individual (Desktop)
content = content.replace(/hasPerm\('reports_sales'\) && <DropdownItem to="\/reports\/sales-return"/g, 'hasPerm(\'reports_sales_return\') && <DropdownItem to="/reports/sales-return"');
content = content.replace(/hasPerm\('reports_sales'\) && <DropdownItem to="\/reports\/product-wise-sales"/g, 'hasPerm(\'reports_product_wise_sales\') && <DropdownItem to="/reports/product-wise-sales"');
content = content.replace(/hasPerm\('reports_purchase'\) && <DropdownItem to="\/reports\/purchase-return"/g, 'hasPerm(\'reports_purchase_return\') && <DropdownItem to="/reports/purchase-return"');
content = content.replace(/hasPerm\('reports_financial'\) && <DropdownItem to="\/reports\/stock"/g, 'hasPerm(\'reports_stock\') && <DropdownItem to="/reports/stock"');
content = content.replace(/hasPerm\('reports_financial'\) && <DropdownItem to="\/reports\/profit-ledger"/g, 'hasPerm(\'reports_profit_ledger\') && <DropdownItem to="/reports/profit-ledger"');
content = content.replace(/hasPerm\('reports_financial'\) && <DropdownItem to="\/reports\/expenses"/g, 'hasPerm(\'reports_expense\') && <DropdownItem to="/reports/expenses"');
content = content.replace(/hasPerm\('reports_financial'\) && <DropdownItem to="\/reports\/customer-receipts"/g, 'hasPerm(\'reports_customer_receipts\') && <DropdownItem to="/reports/customer-receipts"');
content = content.replace(/hasPerm\('reports_financial'\) && <DropdownItem to="\/reports\/supplier-payments"/g, 'hasPerm(\'reports_supplier_payments\') && <DropdownItem to="/reports/supplier-payments"');

fs.writeFileSync(file, content, 'utf8');
console.log('MainLayout Pos updated');
