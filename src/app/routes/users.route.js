import { Router } from "express";
import {
  signUp,
  signIn,
  getCurrentUser,
} from "../controllers/users.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";

const router = Router();

router.post("/create", signUp);
router.post("/login", signIn);
router.get("/me", authenticate, getCurrentUser);

export default router;
