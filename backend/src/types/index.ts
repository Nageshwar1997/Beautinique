import { ObjectId } from "mongoose";

export interface UploadImageResult {
  url: string;
  secure_url: string;
  public_id: string;
  api_key?: string;
  folder?: string;
  original_filename?: string;
  asset_id?: string;
  [key: string]: any; // Add more fields as needed
}

export interface ImageUploaderProps {
  file: Express.Multer.File;
  folder?: string;
}
