declare class PurchaseItemDto {
    productId: number;
    quantity: number;
    rate: number;
    tax?: number;
    amount: number;
    wRate?: number;
    sRate?: number;
    mrp?: number;
}
export declare class CreatePurchaseDto {
    invoiceNo: string;
    date: string;
    invoiceDate?: string;
    supplierInvoiceNo?: string;
    supplierId: number;
    paymentModeId: number;
    subtotal: number;
    tax?: number;
    discount?: number;
    grandTotal: number;
    items: PurchaseItemDto[];
}
export {};
