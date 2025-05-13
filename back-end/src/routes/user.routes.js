import { Router } from "express";
import { createUser, loginUser, logoutUser, getUser } from "../users/controller/user.controller.js";

const router = Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/user", getUser);

export default router;