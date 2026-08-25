"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateExpenseCategoryDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_expense_category_dto_1 = require("./create-expense-category.dto");
class UpdateExpenseCategoryDto extends (0, mapped_types_1.PartialType)(create_expense_category_dto_1.CreateExpenseCategoryDto) {
}
exports.UpdateExpenseCategoryDto = UpdateExpenseCategoryDto;
//# sourceMappingURL=update-expense-category.dto.js.map