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
exports.ExpenseCategoriesController = void 0;
const common_1 = require("@nestjs/common");
const expense_categories_service_1 = require("./expense-categories.service");
const create_expense_category_dto_1 = require("./dto/create-expense-category.dto");
const update_expense_category_dto_1 = require("./dto/update-expense-category.dto");
let ExpenseCategoriesController = class ExpenseCategoriesController {
    expenseCategoriesService;
    constructor(expenseCategoriesService) {
        this.expenseCategoriesService = expenseCategoriesService;
    }
    create(createExpenseCategoryDto) {
        return this.expenseCategoriesService.create(createExpenseCategoryDto);
    }
    findAll() {
        return this.expenseCategoriesService.findAll();
    }
    findOne(id) {
        return this.expenseCategoriesService.findOne(+id);
    }
    update(id, updateExpenseCategoryDto) {
        return this.expenseCategoriesService.update(+id, updateExpenseCategoryDto);
    }
    remove(id) {
        return this.expenseCategoriesService.remove(+id);
    }
};
exports.ExpenseCategoriesController = ExpenseCategoriesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_expense_category_dto_1.CreateExpenseCategoryDto]),
    __metadata("design:returntype", void 0)
], ExpenseCategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExpenseCategoriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExpenseCategoriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_expense_category_dto_1.UpdateExpenseCategoryDto]),
    __metadata("design:returntype", void 0)
], ExpenseCategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExpenseCategoriesController.prototype, "remove", null);
exports.ExpenseCategoriesController = ExpenseCategoriesController = __decorate([
    (0, common_1.Controller)('expense-categories'),
    __metadata("design:paramtypes", [expense_categories_service_1.ExpenseCategoriesService])
], ExpenseCategoriesController);
//# sourceMappingURL=expense-categories.controller.js.map