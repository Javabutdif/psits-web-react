import { Request, Response } from "express";
import { IStudent } from "../models/student.interface";
import { Student } from "../models/student.model";
import { user_model } from "../model_template/model_data";

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findStudentByLookupId = async (rawIdNumber: string) => {
  const normalized = rawIdNumber.trim();
  const baseIdNumber = normalized.split("-")[0]?.trim() ?? "";

  let student = await Student.findOne({ id_number: normalized });

  if (!student && baseIdNumber) {
    student = await Student.findOne({
      id_number: new RegExp(`^${escapeRegex(baseIdNumber)}(?:-.*)?$`),
    });
  }

  return student;
};

export const getStudentProfile = async(req: Request, res: Response)=>{
  try{
    const {id_number} = req.params;
    const profile: IStudent | null = await Student.findOne({id_number})
    .select('id_number first_name last_name course year email campus -_id');;
    if(!profile){
      return res.status(404).json({message: "Profile Not Found!"});
    }
    return res.status(200).json({ data: profile });
  }catch(error){
    console.error('Error fetching student profile:', error);
    return res.status(500).json({ message: 'Server error' });  
  }
}

export const getStudentLookupForAdmin = async (
  req: Request,
  res: Response
) => {
  try {
    const { id_number } = req.params;

    if (!id_number?.trim()) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const student: IStudent | null = await findStudentByLookupId(id_number);

    if (!student) {
      return res.status(404).json({ message: "Student not found!" });
    }

    return res.status(200).json({ data: user_model(student) });
  } catch (error) {
    console.error("Error fetching student lookup:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
