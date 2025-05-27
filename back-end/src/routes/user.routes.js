import { Router } from "express";
import { createUser, loginUser, getUser } from "../users/controller/user.controller.js";

const router = Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/user", getUser);

export default router;