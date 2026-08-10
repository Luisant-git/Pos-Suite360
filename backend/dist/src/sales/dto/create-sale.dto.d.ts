declare class SaleItemDto {
    productId: number;
    quantity: number;
    rate: number;
    discount?: number;
    tax?: number;
    amount: number;
}
export declare class CreateSaleDto {
    invoiceNo: string;
    date: string;
    customerId: number;
    paymentModeId: number;
    subtotal: number;
    tax?: number;
    discount?: number;
    grandTotal: number;
    items: SaleItemDto[];
}
export {};
