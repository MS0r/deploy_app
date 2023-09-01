class CustomError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
    }
}

const newCustomError = (msg, statusCode) => {
    return new CustomError(msg, statusCode)
}

export { CustomError, newCustomError }