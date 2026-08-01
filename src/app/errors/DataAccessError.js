export default class DataAccessError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "DataAccessError";
  }
}
