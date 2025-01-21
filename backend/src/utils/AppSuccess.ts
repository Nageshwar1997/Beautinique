export default class AppSuccess {
  statusCode: number;
  message: string;
  success: boolean = true;
  error: boolean = false;
  [key: string]: any; // Allow additional dynamic properties

  constructor(
    message: string,
    statusCode: number,
    responseObject: Record<string, any> = {}
  ) {
    this.statusCode = statusCode;
    this.message = message;

    // Spread additional properties directly into the instance
    Object.assign(this, responseObject);
  }
}
