import express from "express";
import multer from "multer";
import {
  uploadCSV,
  getBooks,
  deleteAll,
  bulkUpdateBooks,
} from "../controllers/book.controllers.js";

const router = express.Router();
const upload = multer();

router.post("/upload", upload.single("file"), uploadCSV);
router.get("/", getBooks);
router.put("/", bulkUpdateBooks);
router.delete("/", deleteAll);

export default router;
