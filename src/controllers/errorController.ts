import appError from '../utils/appError';

const handelGlobalError = (err: any, req: any, res: any, next: any) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // handelDuplicateValue from DB
  const handelDuplicateValue = (err: any) => {
    const message = `Duplicate value at field ${JSON.stringify(err.keyValue)} plaese use another value`;
    return new appError(message, 400);
  };
  // handleCastError from Db
  const handleCastError = (err: any) => {
    const message = `CastError of path ${err.path} : ${err.value}`;
    return new appError(message, 400);
  };
  // handleValidationError
  const handleValidationError = (err: any) => {
    let value = JSON.stringify(err.errors).match(/(?<="message":").*(?=","properties")/gim);
    const message = `Validation Error: ${value}`;
    return new appError(message, 400);
  };
  // handleJsonWebTokenError
  const handleJsonWebTokenError = () => {
    return new appError('invalid token! please login again', 401);
  };
  // handleTokenExpiredError
  const handleTokenExpiredError = () => {
    return new appError('token has been exprise!! please login again', 401);
  };
  // seprate function
  const sendErrorProd = (err: any, res: any) => {
    if (err.isOperational) {
      console.log('show case', err);
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message || 'loi roi',
      });
    } else {
      // throw error when system has any error we cannot predict
      console.log('ERROR 💀');
      res.status(500).json({ status: 'error', message: 'something wrong we cannot handel and can not predict' });
    }
  };
  const sendErrorDev = (err: any, res: any) => {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  };
  //   chia moi truong
  if (process.env.NODE_ENV === 'development') {
    console.log('chay hien thi loi o che do dev');
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'development1') {
    console.log('chay hien thi loi o che do prod');
    // console.log(err);
    let error = { ...err };
    error.message = err.message;
    // handle loi duplicate value from DB
    if (err.code === 11000) {
      error = handelDuplicateValue(error);
    }
    // handel castError
    if (err.name === 'CastError') {
      error = handleCastError(error);
    }
    // handel validation DB
    if (err.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    // JsonWebTokenError
    if (err.name === 'JsonWebTokenError') {
      error = handleJsonWebTokenError();
    }
    // TokenExpiredError
    if (err.name === 'TokenExpiredError') {
      error = handleTokenExpiredError();
    }
    // send error
    sendErrorProd(error, res);
  }
};
export default handelGlobalError;
