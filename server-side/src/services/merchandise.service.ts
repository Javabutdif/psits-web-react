import { Merch } from "../models/merch.model";

class MerchandiseService {
  //Number of published merchandise, it is used in the admin dashboard
  getPublishCount = async () => {
    try {
      const now = new Date();

      const count = await Merch.countDocuments({
        is_active: true,
        start_date: { $lte: now },
        end_date: { $gte: now },
      });
      return count;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
}

const merchandiseService = new MerchandiseService();
export { merchandiseService };
