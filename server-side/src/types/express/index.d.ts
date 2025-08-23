import { IAdmin } from "../../models/admin.interface";
import { IStudent } from "../../models/student.interface";
import {
  IAdminModelData,
  IUserModelData,
} from "model_template/model_data.interface";

declare global {
  namespace Express {
    interface Request {
      both: IAdminModelData | IUserModelData;
      admin: IAdminModelData;
      student: IUserModelData;
    }
  }
}
