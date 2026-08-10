export default class AppError extends Error {
  constructor(message, statusCode, clientCode) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.clientCode = clientCode;
  }
}