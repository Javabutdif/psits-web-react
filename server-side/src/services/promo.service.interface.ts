import { IPromo } from "../models/promo.interface";
export interface IOrderPromoEligibility {
  promo: IPromo;
  promoDiscount: ICheckPromoEligibityResult;
}
export interface ICheckPromoEligibityResult {
  discount: number;
  verfied: boolean;
}
