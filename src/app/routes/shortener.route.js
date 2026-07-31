import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import * as urlShortener from "../controllers/shortener.controller.js";

const router = Router();

router.post("/create", authenticate, urlShortener.create);
router.get("/:code", urlShortener.getOriginal);
router.delete("/:urlId", urlShortener.deleteUrl);

export default router;
