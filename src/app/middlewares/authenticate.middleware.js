import { verifyJwtToken } from "../services/users.service.js";
import jwt from "jsonwebtoken";
import { Errors, createAppError } from "../errors/errorDefinitions.js";

export function authenticate(req, res, next) {
  const jwtToken = req.cookies.token;
  if (!jwtToken) {
    return res.status(401).json({ error: "Missing Token" });
  }
  /*
  Handle error here, because not like DataAccessError,
  it scatters many places, it should have a centralized
  place to handle errors from sources. But this authenticate
  middleware is only source for error, so handling error here
  is best place
  */
  try {
    const userId = verifyJwtToken(jwtToken, process.env.JWT_SECRET)["sub"];
    req.userId = Number(userId);
  } catch (error) {
    if (
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError
    )
      // 401 means can't not authenticate
      next(createAppError(Errors.INVALID_TOKEN))
    
    return next(error);
  }
  // next to hand off responsibility to handle error
  // although every errors jwt.verify throws are JsonWebTokenError and subclasses
  // i still write it here to learn that i can hand off errors
  next();
}
