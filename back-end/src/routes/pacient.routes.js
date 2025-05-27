import { Router } from "express";
import { createPacient, getPacient, getPacients } from "../pacients/controller/pacient.controller.js";


const router = Router();

router.post("/validatePacient", getPacient);
router.post("/createPacient", createPacient)

export default router;