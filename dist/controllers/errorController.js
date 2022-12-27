"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = __importDefault(require("../utils/appError"));
const handelGlobalError = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    const handelDuplicateValue = (err) => {
        const message = `Duplicate value at field ${JSON.stringify(err.keyValue)} plaese use another value`;
        return new appError_1.default(message, 400);
    };
    const handleCastError = (err) => {
        const message = `CastError of path ${err.path} : ${err.value}`;
        return new appError_1.default(message, 400);
    };
    const handleValidationError = (err) => {
        let value = JSON.stringify(err.errors).match(/(?<="message":").*(?=","properties")/gim);
        const message = `Validation Error: ${value}`;
        return new appError_1.default(message, 400);
    };
    const handleJsonWebTokenError = () => {
        return new appError_1.default('invalid token! please login again', 401);
    };
    const handleTokenExpiredError = () => {
        return new appError_1.default('token has been exprise!! please login again', 401);
    };
    const sendErrorProd = (err, res) => {
        if (err.isOperational) {
            console.log('show case', err);
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message || 'loi roi',
            });
        }
        else {
            console.log('ERROR 💀');
            res.status(500).json({ status: 'error', message: 'something wrong we cannot handel and can not predict' });
        }
    };
    const sendErrorDev = (err, res) => {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            error: err,
            stack: err.stack,
        });
    };
    if (process.env.NODE_ENV === 'development') {
        console.log('chay hien thi loi o che do dev');
        sendErrorDev(err, res);
    }
    else if (process.env.NODE_ENV === 'development1') {
        console.log('chay hien thi loi o che do prod');
        let error = Object.assign({}, err);
        error.message = err.message;
        if (err.code === 11000) {
            error = handelDuplicateValue(error);
        }
        if (err.name === 'CastError') {
            error = handleCastError(error);
        }
        if (err.name === 'ValidationError') {
            error = handleValidationError(error);
        }
        if (err.name === 'JsonWebTokenError') {
            error = handleJsonWebTokenError();
        }
        if (err.name === 'TokenExpiredError') {
            error = handleTokenExpiredError();
        }
        sendErrorProd(error, res);
    }
};
exports.default = handelGlobalError;
//# sourceMappingURL=errorController.js.map