import { Merch } from "../models/merch.model";
import { Student } from "../models/student.model";
import { Orders } from "../models/orders.model";
import { Admin } from "../models/admin.model";
import { Log } from "../models/log.model";
import { Event } from "../models/event.model";
import mongoose, { Types } from "mongoose";
import { IMerch } from "../models/merch.interface";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Request, Response } from "express";
import dotenv from "dotenv";
import { S3Client } from "@aws-sdk/client-s3";
import { expiryStatus } from "../custom_function/conditional_dates";
dotenv.config();
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});


