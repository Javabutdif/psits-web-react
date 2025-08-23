import { IAdmin } from "../../models/admin.interface";
import { IStudent } from "../../models/student.interface";
import {
  IAdminModelData,
  IUserModelData,
  IAdminModelDataDocument,
} from "model_template/model_data.interface";

declare global {
  namespace Express {
    interface Request {
      both: IAdminModelData | IUserModelData;
      admin: IAdminModelData | IAdminModelDataDocument | any;
      student: IUserModelData;
    }
  }
}
