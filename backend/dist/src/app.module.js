"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const products_module_1 = require("./products/products.module");
const categories_module_1 = require("./categories/categories.module");
const brands_module_1 = require("./brands/brands.module");
const suppliers_module_1 = require("./suppliers/suppliers.module");
const customers_module_1 = require("./customers/customers.module");
const units_module_1 = require("./units/units.module");
const payment_modes_module_1 = require("./payment-modes/payment-modes.module");
const payment_types_module_1 = require("./payment-types/payment-types.module");
const expense_categories_module_1 = require("./expense-categories/expense-categories.module");
const prisma_module_1 = require("./prisma/prisma.module");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const purchases_module_1 = require("./purchases/purchases.module");
const sales_module_1 = require("./sales/sales.module");
const supplier_payments_module_1 = require("./supplier-payments/supplier-payments.module");
const customer_receipts_module_1 = require("./customer-receipts/customer-receipts.module");
const settings_module_1 = require("./settings/settings.module");
const purchase_returns_module_1 = require("./purchase-returns/purchase-returns.module");
const sales_returns_module_1 = require("./sales-returns/sales-returns.module");
const expenses_module_1 = require("./expenses/expenses.module");
const whatsapp_module_1 = require("./whatsapp/whatsapp.module");
const reports_module_1 = require("./reports/reports.module");
const roles_module_1 = require("./roles/roles.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'uploads'),
                serveRoot: '/uploads/',
            }),
            products_module_1.ProductsModule,
            categories_module_1.CategoriesModule,
            brands_module_1.BrandsModule,
            suppliers_module_1.SuppliersModule,
            customers_module_1.CustomersModule,
            units_module_1.UnitsModule,
            payment_modes_module_1.PaymentModesModule,
            payment_types_module_1.PaymentTypesModule,
            expense_categories_module_1.ExpenseCategoriesModule,
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            dashboard_module_1.DashboardModule,
            purchases_module_1.PurchasesModule,
            sales_module_1.SalesModule,
            supplier_payments_module_1.SupplierPaymentsModule,
            customer_receipts_module_1.CustomerReceiptsModule,
            settings_module_1.SettingsModule,
            purchase_returns_module_1.PurchaseReturnsModule,
            sales_returns_module_1.SalesReturnsModule,
            expenses_module_1.ExpensesModule,
            whatsapp_module_1.WhatsappModule,
            reports_module_1.ReportsModule,
            roles_module_1.RolesModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map