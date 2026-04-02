import { Type } from "@aws-sdk/client-s3";
import { Log } from "../models/log.model";
import { Types } from "mongoose";

class LogService {
  //Create Logs
  create = async (params: any) => {
    try {
      await new Log({
        params,
      }).save();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
}
const logService = new LogService();
export { logService };
