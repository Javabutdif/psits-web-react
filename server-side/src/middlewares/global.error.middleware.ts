import { Request, Response, NextFunction } from "express";
import { IResponseMessage } from "../models/global.response.interface";
import { logServerError } from "../services/devtools.service";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Do not store expected refresh-token-miss errors in the devtools error log.
  const isExpectedRefreshMiss =
    err?.code === "AUTH_005" && req.path?.includes("/auth/refresh");
  if (!isExpectedRefreshMiss) {
    logServerError(err, req);
  }

  const response: any = {
    status: err.statusCode || 500,
    message: err.message || "Internal Server Error",
    ...(err.data !== undefined && { data: err.data }),
  };

  res.status(response.status).json(response);
};
