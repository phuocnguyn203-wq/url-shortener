import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import * as urlShortener from "../controllers/shortener.controller.js";

const router = Router();

router.get("/", authenticate, urlShortener.allMyShortUrls);
router.get("/deleted", authenticate, urlShortener.allMyDeletedShortUrls);
router.get("/:code", urlShortener.redirectToOriginalUrl);
router.post("/", authenticate, urlShortener.createShortUrl);
router.delete("/:code", authenticate, urlShortener.deleteShortUrl);

export default router;
