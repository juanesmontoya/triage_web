import { Router } from "express";
import { getSymptoms, createSymptom, deleteSymptom } from "../symptoms/controller/symptom.controller.js";

const router = Router();

router.get("/getSymptoms", getSymptoms);
router.post("/createSymptom", createSymptom);
router.post("/deleteSymptom/", deleteSymptom);

export default router;