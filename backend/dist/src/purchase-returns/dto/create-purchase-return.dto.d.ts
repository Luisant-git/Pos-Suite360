export declare class PurchaseReturnItemDto {
    productId: number;
    returnQty: number;
    rate: number;
    amount: number;
}
export declare class CreatePurchaseReturnDto {
    returnNo: string;
    date: string;
    purchaseId?: number;
    supplierId: number;
    remarks?: string;
    totalAmount: number;
    items: PurchaseReturnItemDto[];
}
