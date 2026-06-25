import { Promo } from "../models/promo.model";
import { Orders } from "../models/orders.model";
import { PromoLog } from "../models/promo.log.model";
import { PromoUsage } from "../models/promo.usage.model";

export const checkPromos = async () => {
  try {
    const current = new Date();

    const invalidPromos = await Promo.find({
      $or: [
        { start_date: { $gt: current } },
        { end_date: { $lt: current } },
        { status: "Deleted" },
      ],
    });

    if (!invalidPromos.length) {
      await PromoLog.create({ description: "No invalid promos found." });
      return;
    }

    for (const promo of invalidPromos) {
      const relatedOrders = await Orders.find({
        "promo._id": promo._id,
        order_status: "Pending",
      });
      const orderIds = relatedOrders.map((order) => order._id);

      if (relatedOrders.length > 0) {
        const result = await Orders.deleteMany({
          "promo._id": promo._id,
          order_status: "Pending",
        });

        await PromoUsage.deleteMany({
          promo_id: promo._id,
          order_id: { $in: orderIds },
        });

        const newQuantity = promo.quantity + result.deletedCount;

        await Promo.findByIdAndUpdate(promo._id, {
          $set: { quantity: newQuantity },
        });

        const message = `🗑️ Deleted ${result.deletedCount} pending orders using expired promo "${promo.promo_name}". ♻️ Restocked to quantity: ${newQuantity}`;

        await PromoLog.create({ description: message });
      } else {
        const message = `⚠️ No pending orders found using promo "${promo.promo_name}".`;

        await PromoLog.create({ description: message });
      }
    }

    await PromoLog.create({
      description: "Promo check and restock completed.",
    });
  } catch (error) {
    console.error("❌ Error during promo cleanup:", error);
    await PromoLog.create({
      description: `Error during promo cleanup: ${error}`,
    });
  }
};
