import { Log } from "../models/log.model";
import { Types } from "mongoose";

export interface LogParams {
  admin: string;
  admin_id?: Types.ObjectId | string;
  action: string;
  target?: string;
  target_id?: Types.ObjectId | string;
  target_model?: string;
  timestamp?: Date;
}

class LogService {
  //Create Logs
  create = async (params: LogParams) => {
    await new Log(params).save();
  };
}
const logService = new LogService();
export { logService };
