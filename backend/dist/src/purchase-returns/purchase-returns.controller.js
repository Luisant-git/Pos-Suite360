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
exports.PurchaseReturnsController = void 0;
const common_1 = require("@nestjs/common");
const purchase_returns_service_1 = require("./purchase-returns.service");
const create_purchase_return_dto_1 = require("./dto/create-purchase-return.dto");
let PurchaseReturnsController = class PurchaseReturnsController {
    purchaseReturnsService;
    constructor(purchaseReturnsService) {
        this.purchaseReturnsService = purchaseReturnsService;
    }
    create(createPurchaseReturnDto) {
        return this.purchaseReturnsService.create(createPurchaseReturnDto);
    }
    getNextCode() {
        return this.purchaseReturnsService.getNextReturnNo();
    }
    findAll() {
        return this.purchaseReturnsService.findAll();
    }
    findOne(id) {
        return this.purchaseReturnsService.findOne(+id);
    }
};
exports.PurchaseReturnsController = PurchaseReturnsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_purchase_return_dto_1.CreatePurchaseReturnDto]),
    __metadata("design:returntype", void 0)
], PurchaseReturnsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('next-code'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PurchaseReturnsController.prototype, "getNextCode", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PurchaseReturnsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchaseReturnsController.prototype, "findOne", null);
exports.PurchaseReturnsController = PurchaseReturnsController = __decorate([
    (0, common_1.Controller)('purchase-returns'),
    __metadata("design:paramtypes", [purchase_returns_service_1.PurchaseReturnsService])
], PurchaseReturnsController);
//# sourceMappingURL=purchase-returns.controller.js.map