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
exports.PaymentTypesController = void 0;
const common_1 = require("@nestjs/common");
const payment_types_service_1 = require("./payment-types.service");
const create_payment_type_dto_1 = require("./dto/create-payment-type.dto");
const update_payment_type_dto_1 = require("./dto/update-payment-type.dto");
let PaymentTypesController = class PaymentTypesController {
    paymentTypesService;
    constructor(paymentTypesService) {
        this.paymentTypesService = paymentTypesService;
    }
    create(createPaymentTypeDto) {
        return this.paymentTypesService.create(createPaymentTypeDto);
    }
    findAll() {
        return this.paymentTypesService.findAll();
    }
    findOne(id) {
        return this.paymentTypesService.findOne(+id);
    }
    update(id, updatePaymentTypeDto) {
        return this.paymentTypesService.update(+id, updatePaymentTypeDto);
    }
    remove(id) {
        return this.paymentTypesService.remove(+id);
    }
};
exports.PaymentTypesController = PaymentTypesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_type_dto_1.CreatePaymentTypeDto]),
    __metadata("design:returntype", void 0)
], PaymentTypesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentTypesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentTypesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_payment_type_dto_1.UpdatePaymentTypeDto]),
    __metadata("design:returntype", void 0)
], PaymentTypesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentTypesController.prototype, "remove", null);
exports.PaymentTypesController = PaymentTypesController = __decorate([
    (0, common_1.Controller)('payment-types'),
    __metadata("design:paramtypes", [payment_types_service_1.PaymentTypesService])
], PaymentTypesController);
//# sourceMappingURL=payment-types.controller.js.map