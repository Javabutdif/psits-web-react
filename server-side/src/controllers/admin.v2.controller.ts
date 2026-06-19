import { Request, Response } from "express";
import { studentService } from "../services/student.service";
import { user_model } from "../model_template/model_data";
import { catchAsync } from "../util/catch.async.util";

export const getSearchStudentByIdController = catchAsync(
  async (req: Request, res: Response) => {
    const { id_number } = req.params;

    const student = await studentService.getSpecific(id_number);

    return res.status(200).json({ data: user_model(student) });
  }
);

export const getStudentCountController = catchAsync(
  async (req: Request, res: Response) => {
    const response = await studentService.count();

    res.status(200).json(response);
  }
);
