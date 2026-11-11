export const VERIFIED_PURCHASE_PORT = 'VERIFIED_PURCHASE_PORT';

export interface IVerifiedPurchasePort {
  hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean>;
}

