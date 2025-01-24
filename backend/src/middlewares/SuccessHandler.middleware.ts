import { Response } from "express";

const SuccessResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any
) => {
  return res.status(statusCode).json({
    success: true,
    error: false,
    message,
    ...data,
  });
};

export default SuccessResponse;
