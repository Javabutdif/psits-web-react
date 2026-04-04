import bcrypt from "bcryptjs";
import { account_status } from "../enums/status.enums";
import { general_roles } from "../enums/role.enums";

class IndexService {
  //Check Validation for Student / Admin Logins
  checkValidation = async (role: string, password: string, data: any) => {
    try {
      if (role === general_roles.STUDENT) {
        const passwordMatch = await bcrypt.compare(password, data.password);

        if (passwordMatch && data.status === account_status.DELETED) {
          return { status: false, message: "Your account has been deleted!" };
        } else if (passwordMatch && data.status === account_status.ACTIVE) {
          return { status: true, users: data, role: general_roles.STUDENT };
        } else {
          return { status: false, message: "Invalid ID number or password" };
        }
      } else {
        const passwordMatch = await bcrypt.compare(password, data.password);

        if (passwordMatch && data.status === account_status.SUSPENDED) {
          return {
            status: false,
            message:
              "Your account has been suspended! Please contact president",
          };
        } else if (passwordMatch && data.status === account_status.ACTIVE) {
          return { status: true, users: data, role: general_roles.ADMIN };
        } else {
          return { status: false, message: "Invalid ID number or password" };
        }
      }
    } catch (error) {
      console.error(error);
      return { status: false, message: "Invalid ID number or password" };
    }
  };
}

const indexService = new IndexService();
export { indexService };
