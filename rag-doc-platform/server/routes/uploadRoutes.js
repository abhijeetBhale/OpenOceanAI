import express from "express";
import { uploadDocument } from "../controllers/uploadController.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Use diskStorage to preserve original file extension so browser can preview
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    const safeName = `${Date.now()}-${file.originalname.replaceAll(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    cb(null, safeName);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("file"), uploadDocument);

export default router;
