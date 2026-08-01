import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import * as urlShortener from "../controllers/shortener.controller.js";

const router = Router();

router.post("/", authenticate, urlShortener.createShortUrl);
router.get("/:code", urlShortener.redirectToOriginalUrl);
router.delete("/:code", authenticate, urlShortener.deleteShortUrl);

export default router;
