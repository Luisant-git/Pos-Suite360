export declare class SalesReturnItemDto {
    productId: number;
    returnQty: number;
    rate: number;
    amount: number;
}
export declare class CreateSalesReturnDto {
    returnNo: string;
    date: string;
    saleId?: number;
    customerId: number;
    remarks?: string;
    totalAmount: number;
    items: SalesReturnItemDto[];
}
