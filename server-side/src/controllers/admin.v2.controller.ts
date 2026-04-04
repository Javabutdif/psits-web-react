import { Request, Response } from "express";
import { studentService } from "../services/student.service";
import { user_model } from "../model_template/model_data";
import { Student } from "../models/student.model";

export const getSearchStudentByIdController = async (
  req: Request,
  res: Response
) => {
  const { id_number } = req.params;
  try {
    const student = await studentService.getId(id_number);

    if (!student) {
      res.status(404).json({
        message: "Student not found!",
      });
    } else {
      res.status(200).json({ data: user_model(student) });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error: error });
  }
};

export const getStudentCountController = async (res: Response) => {
  try {
    const response = await studentService.count();

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error: error });
  }
};
