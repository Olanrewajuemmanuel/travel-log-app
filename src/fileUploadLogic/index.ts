import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid"
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuid() + Date.now()     
      cb(null, file.fieldname + '_' + uniqueSuffix + path.extname(file.originalname));
    },
  });
  const fileFilter = (req: any, file: any, cb: any) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png"
    ) {
      cb(null, true)
    } else {
      cb(new Error("File must be of type jpg, jpeg or png"), false)
    }
  };
  const limits = {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
  
export const upload = multer({ storage: storage, fileFilter: fileFilter, limits: limits })