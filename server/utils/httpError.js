/**
 * An error that carries the HTTP status the API should respond with.
 * Thrown anywhere in the backend and turned into a JSON response by the error handler.
 */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
