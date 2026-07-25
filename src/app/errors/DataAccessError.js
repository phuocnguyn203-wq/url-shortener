export default class DataAccessError extends Error {
  constructor(message) {
    super(message);
    this.name = "DataAccessError";
  }
}
