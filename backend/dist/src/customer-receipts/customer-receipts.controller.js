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
exports.CustomerReceiptsController = void 0;
const common_1 = require("@nestjs/common");
const customer_receipts_service_1 = require("./customer-receipts.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CustomerReceiptsController = class CustomerReceiptsController {
    customerReceiptsService;
    constructor(customerReceiptsService) {
        this.customerReceiptsService = customerReceiptsService;
    }
    async getNextReceiptNo() {
        return { receiptNo: await this.customerReceiptsService.generateReceiptNo() };
    }
    async getBalance(id) {
        return this.customerReceiptsService.getBalance(Number(id));
    }
    async getUnpaidBills(id) {
        return this.customerReceiptsService.getUnpaidBills(Number(id));
    }
    async create(createCustomerReceiptDto, req) {
        const userId = req.user?.userId || 1;
        return this.customerReceiptsService.create(createCustomerReceiptDto, userId);
    }
    async findAll() {
        return this.customerReceiptsService.findAll();
    }
};
exports.CustomerReceiptsController = CustomerReceiptsController;
__decorate([
    (0, common_1.Get)('next-receipt-no'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomerReceiptsController.prototype, "getNextReceiptNo", null);
__decorate([
    (0, common_1.Get)('balance/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerReceiptsController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('unpaid-bills/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerReceiptsController.prototype, "getUnpaidBills", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerReceiptsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomerReceiptsController.prototype, "findAll", null);
exports.CustomerReceiptsController = CustomerReceiptsController = __decorate([
    (0, common_1.Controller)('customer-receipts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [customer_receipts_service_1.CustomerReceiptsService])
], CustomerReceiptsController);
//# sourceMappingURL=customer-receipts.controller.js.map