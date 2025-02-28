export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class AppSuccess {
  statusCode: number;
  message: string;
  [key: string]: any; // Allows additional properties

  constructor(
    message: string,
    data: Record<string, any> = {},
    statusCode: number = 200
  ) {
    this.statusCode = statusCode;
    this.message = message;

    // Spread all key-value pairs into the instance
    Object.assign(this, data);
  }
}
