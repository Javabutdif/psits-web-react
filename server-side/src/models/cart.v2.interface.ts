import { Types } from "mongoose";


/*
This version have the student to have 1 cart then the cart will have to foreign for cart items with specific cart items order.

This is safe to delete in the legacy code base because cart items arent in use.


The cart is created  when the student add items into the cart,

The ICartV2 is the cart specific by the student so its only one, the ICartItemsV2 is the items of multiple, it will foreign to the merchandise model and only saves the document of the sizes they pick or variation.


*/
export interface ICartV2 {
  id_number: string,
 
}

export interface ICartItemsV2{
  cart_id: Types.ObjectId,
  product_id : Types.ObjectId,
  quantity: number,
  sizes: string,
  variation: string,
}
