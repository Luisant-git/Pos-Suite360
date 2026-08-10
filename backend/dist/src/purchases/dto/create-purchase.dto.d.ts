declare class PurchaseItemDto {
    productId: number;
    quantity: number;
    rate: number;
    tax?: number;
    amount: number;
}
export declare class CreatePurchaseDto {
    invoiceNo: string;
    date: string;
    supplierId: number;
    paymentModeId: number;
    subtotal: number;
    tax?: number;
    discount?: number;
    grandTotal: number;
    items: PurchaseItemDto[];
}
export {};
