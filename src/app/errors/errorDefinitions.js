import AppError from "./AppError.js";
export const Errors = {
  URL_REQUIRED: {
    statusCode: 400,
    code: "URL_REQUIRED",
    message: "URL is required",
  },

  INVALID_URL: {
    statusCode: 400,
    code: "INVALID_URL",
    message: "Only HTTP and HTTPS URLs are supported",
  },

  INVALID_CREDENTIAL_INPUT: {
    statusCode: 400,
    code: "INVALID_CREDENTIAL_INPUT",
    message: "Username and password are required",
  },

  INVALID_CREDENTIALS: {
    statusCode: 401,
    code: "INVALID_CREDENTIALS",
    message: "Invalid credentials",
  },

  MISSING_TOKEN: {
    statusCode: 401,
    code: "MISSING_TOKEN",
    message: "Authentication token is required",
  },

  INVALID_TOKEN: {
    statusCode: 401,
    code: "INVALID_TOKEN",
    message: "Authentication token is invalid",
  },

  SHORT_URL_NOT_FOUND: {
    statusCode: 404,
    code: "SHORT_URL_NOT_FOUND",
    message: "Short URL was not found",
  },

  USERNAME_ALREADY_EXISTS: {
    statusCode: 409,
    code: "USERNAME_ALREADY_EXISTS",
    message: "Username already exists",
  },
};

export function createAppError(definition) {
  return new AppError(
    definition.message,
    definition.statusCode,
    definition.code,
  )
};
