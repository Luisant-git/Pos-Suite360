"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesReturnsModule = void 0;
const common_1 = require("@nestjs/common");
const sales_returns_service_1 = require("./sales-returns.service");
const sales_returns_controller_1 = require("./sales-returns.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let SalesReturnsModule = class SalesReturnsModule {
};
exports.SalesReturnsModule = SalesReturnsModule;
exports.SalesReturnsModule = SalesReturnsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [sales_returns_controller_1.SalesReturnsController],
        providers: [sales_returns_service_1.SalesReturnsService],
    })
], SalesReturnsModule);
//# sourceMappingURL=sales-returns.module.js.map