import { Promo } from "../models/promo.model";
import { IPromoOrder } from "../models/orders.interface";
import mongoose, {Types, ClientSession} from "mongoose";
import { AppError } from "../util/app.error.util";


class PromoService{
    //Check eligibility of promo
    checkPromo = async(promo_id:Types.ObjectId)=>{
        const result = await Promo.findOne({promo_id});
        if(!result){
            throw new AppError("Promo does not exist!",404);
        }
    }
}