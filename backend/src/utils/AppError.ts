export default class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    // Set the prototype explicitly (required for custom error classes in TypeScript)
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
