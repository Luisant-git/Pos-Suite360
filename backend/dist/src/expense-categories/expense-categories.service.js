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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseCategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ExpenseCategoriesService = class ExpenseCategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createExpenseCategoryDto) {
        return this.prisma.expenseCategory.create({
            data: createExpenseCategoryDto,
        });
    }
    findAll() {
        return this.prisma.expenseCategory.findMany();
    }
    findOne(id) {
        return this.prisma.expenseCategory.findUnique({ where: { id } });
    }
    update(id, updateExpenseCategoryDto) {
        return this.prisma.expenseCategory.update({
            where: { id },
            data: updateExpenseCategoryDto,
        });
    }
    remove(id) {
        return this.prisma.expenseCategory.delete({ where: { id } });
    }
};
exports.ExpenseCategoriesService = ExpenseCategoriesService;
exports.ExpenseCategoriesService = ExpenseCategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpenseCategoriesService);
//# sourceMappingURL=expense-categories.service.js.map