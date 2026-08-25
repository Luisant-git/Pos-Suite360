"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePaymentTypeDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_payment_type_dto_1 = require("./create-payment-type.dto");
class UpdatePaymentTypeDto extends (0, mapped_types_1.PartialType)(create_payment_type_dto_1.CreatePaymentTypeDto) {
}
exports.UpdatePaymentTypeDto = UpdatePaymentTypeDto;
//# sourceMappingURL=update-payment-type.dto.js.map