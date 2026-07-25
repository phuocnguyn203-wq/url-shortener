import { Router } from "express";
import * as shortenerUrl from "../controllers/shortener.controller.js";

const router = Router();

router.post("/create", shortenerUrl.create);
router.get("/:code", shortenerUrl.getOriginal);

export default router;
