"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierPaymentsController = void 0;
const common_1 = require("@nestjs/common");
const supplier_payments_service_1 = require("./supplier-payments.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let SupplierPaymentsController = class SupplierPaymentsController {
    supplierPaymentsService;
    constructor(supplierPaymentsService) {
        this.supplierPaymentsService = supplierPaymentsService;
    }
    async getNextPaymentNo() {
        return { paymentNo: await this.supplierPaymentsService.generatePaymentNo() };
    }
    async getBalance(id) {
        return this.supplierPaymentsService.getBalance(Number(id));
    }
    async getUnpaidBills(id) {
        return this.supplierPaymentsService.getUnpaidBills(Number(id));
    }
    async create(createSupplierPaymentDto, req) {
        const userId = (req.user?.userId && req.user.userId > 0) ? req.user.userId : 1;
        return this.supplierPaymentsService.create(createSupplierPaymentDto, userId);
    }
    async findAll() {
        return this.supplierPaymentsService.findAll();
    }
};
exports.SupplierPaymentsController = SupplierPaymentsController;
__decorate([
    (0, common_1.Get)('next-payment-no'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SupplierPaymentsController.prototype, "getNextPaymentNo", null);
__decorate([
    (0, common_1.Get)('balance/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SupplierPaymentsController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('unpaid-bills/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SupplierPaymentsController.prototype, "getUnpaidBills", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SupplierPaymentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SupplierPaymentsController.prototype, "findAll", null);
exports.SupplierPaymentsController = SupplierPaymentsController = __decorate([
    (0, common_1.Controller)('supplier-payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [supplier_payments_service_1.SupplierPaymentsService])
], SupplierPaymentsController);
//# sourceMappingURL=supplier-payments.controller.js.map