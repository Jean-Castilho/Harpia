// Base class for custom application errors
class GeneralError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }

  getCode() {
    if (this instanceof ValidationError) {
      return 400;
    }
    if (this instanceof NotFoundError) {
      return 404;
    }
    if (this instanceof UnauthorizedError) {
      return 401;
    }
    return 500; // Internal Server Error
  }
}

// For validation errors (e.g., bad request body)
class ValidationError extends GeneralError {}

// For resources that are not found
class NotFoundError extends GeneralError {}

// For authentication/authorization errors
class UnauthorizedError extends GeneralError {}

export { GeneralError, ValidationError, NotFoundError, UnauthorizedError };
