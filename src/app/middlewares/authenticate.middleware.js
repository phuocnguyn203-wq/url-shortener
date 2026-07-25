import { verifyJwtToken } from "../services/users.service.js";

export function authenticate(req, res, next) {
  const jwtToken = req.cookies.token;
  if (!jwtToken) {
    return res.status(401).json({ error: "Missing Token " });
  }
  const userId = verifyJwtToken(jwtToken, process.env.JWT_SECRET)["sub"];
  req.userId = Number(userId);
  next();
}
