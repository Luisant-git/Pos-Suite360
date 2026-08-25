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
exports.SalesReturnsController = void 0;
const common_1 = require("@nestjs/common");
const sales_returns_service_1 = require("./sales-returns.service");
const create_sales_return_dto_1 = require("./dto/create-sales-return.dto");
let SalesReturnsController = class SalesReturnsController {
    salesReturnsService;
    constructor(salesReturnsService) {
        this.salesReturnsService = salesReturnsService;
    }
    create(createSalesReturnDto) {
        return this.salesReturnsService.create(createSalesReturnDto);
    }
    getNextCode() {
        return this.salesReturnsService.getNextReturnNo();
    }
    findAll() {
        return this.salesReturnsService.findAll();
    }
    findOne(id) {
        return this.salesReturnsService.findOne(+id);
    }
};
exports.SalesReturnsController = SalesReturnsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sales_return_dto_1.CreateSalesReturnDto]),
    __metadata("design:returntype", void 0)
], SalesReturnsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('next-code'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SalesReturnsController.prototype, "getNextCode", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SalesReturnsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesReturnsController.prototype, "findOne", null);
exports.SalesReturnsController = SalesReturnsController = __decorate([
    (0, common_1.Controller)('sales-returns'),
    __metadata("design:paramtypes", [sales_returns_service_1.SalesReturnsService])
], SalesReturnsController);
//# sourceMappingURL=sales-returns.controller.js.map