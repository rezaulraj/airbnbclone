import express from "express";
import multer from "multer";
import {
  createProperty,
  getPropertys,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getAllPropertiesPublic,
  searchProperties,
} from "../controllers/propertyController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/public", getAllPropertiesPublic);
router.get("/search", searchProperties);
router.get("/", protect, getPropertys);
router.get("/:id", protect, getPropertyById);
router.post("/", protect, upload.array("images", 10), createProperty);
router.put("/:id", protect, upload.array("images", 10), updateProperty);
router.delete("/:id", protect, deleteProperty);

export default router;
