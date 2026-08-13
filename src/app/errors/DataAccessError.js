export class DataAccessError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "DataAccessError";
    this.message = message;
  }
}

export function createDataAccessError(message, options) {
  return new DataAccessError(message, options);
}

