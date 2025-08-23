import { IAdmin } from "../../models/admin.interface";

declare global {
  namespace Express {
    interface Request {
      user?: (IAdmin | IStudent) & { role: "Admin" | "Student" };
    }
  }
}
