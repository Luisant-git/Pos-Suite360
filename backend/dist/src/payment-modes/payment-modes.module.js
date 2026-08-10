"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModesModule = void 0;
const common_1 = require("@nestjs/common");
const payment_modes_service_1 = require("./payment-modes.service");
const payment_modes_controller_1 = require("./payment-modes.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let PaymentModesModule = class PaymentModesModule {
};
exports.PaymentModesModule = PaymentModesModule;
exports.PaymentModesModule = PaymentModesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [payment_modes_controller_1.PaymentModesController],
        providers: [payment_modes_service_1.PaymentModesService],
    })
], PaymentModesModule);
//# sourceMappingURL=payment-modes.module.js.map