import { Type } from "@aws-sdk/client-s3";
import { Log } from "../models/log.model";
import { Types } from "mongoose";

class LogService {
  //Create Logs
  create = async (params: any) => {
    await new Log(params).save();
  };
}
const logService = new LogService();
export { logService };
