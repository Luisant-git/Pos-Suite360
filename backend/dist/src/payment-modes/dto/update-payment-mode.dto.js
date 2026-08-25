"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePaymentModeDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_payment_mode_dto_1 = require("./create-payment-mode.dto");
class UpdatePaymentModeDto extends (0, mapped_types_1.PartialType)(create_payment_mode_dto_1.CreatePaymentModeDto) {
}
exports.UpdatePaymentModeDto = UpdatePaymentModeDto;
//# sourceMappingURL=update-payment-mode.dto.js.map