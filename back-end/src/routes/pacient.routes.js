import { Router } from "express";
import { createPacient, getPacient, getPacients } from "../pacients/controller/pacient.controller.js";


const router = Router();

router.post("/validateUser", getPacient);

export default router;