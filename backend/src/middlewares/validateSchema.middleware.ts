// import { Request, Response, NextFunction } from "express";
// import mongoose, { Model } from "mongoose";
// import AppError from "../utils/AppError";

// const validateMongooseSchema = (model: Model<any>) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const tempDoc = new model(req.body);
//       await tempDoc.validate(); // Trigger schema validation
//       next();
//     } catch (err) {
//       if (err instanceof mongoose.Error.ValidationError) {
//         const messages = Object.values(err.errors).map((error) => error.message);
//         next(new AppError(messages.join(", "), 400));
//       } else {
//         next(err);
//       }
//     }
//   };
// };

// export default validateMongooseSchema;
