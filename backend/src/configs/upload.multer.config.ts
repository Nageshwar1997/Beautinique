import multer from "multer";

// Setup Multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;
