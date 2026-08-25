export declare class CreateProductDto {
    name: string;
    code: string;
    barcode?: string;
    categoryId?: number;
    brandId?: number;
    unitId: number;
    purchaseRate?: number;
    sellingRate?: number;
    mrp?: number;
    taxPercent?: number;
    minStock?: number;
    supplierId?: number;
    wholesaleRate?: number;
    reorderLevel?: number;
    currentStock?: number;
}
