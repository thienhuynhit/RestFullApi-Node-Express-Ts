import bodyParser from 'body-parser';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import bookRouter from './routers/bookRouter';
import appError from './utils/appError';
import handelGlobalError from './controllers/errorController';
import userRouter from './routers/userRouter';
import reviewRouter from './routers/reviewRouter';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

const app = express();

// security header
app.use(helmet());

// apply middleware logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// apply middleware to limit requests from per Ip in a time
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60,
  message: 'Too many requests from this Ip! Please try again!!',
});
app.use('/api', limiter);

// applymiddleware cors
app.use(cors());

// apply middleware
app.use(express.static(`${__dirname}/public`));

// apply middleware
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json({ limit: '10kb' }));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['type', 'rating', 'price'],
  })
);

// routing for app
app.use('/api/v1/bookstore', bookRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/review', reviewRouter);
// handle not found url
app.use('*', (req, res, next) => {
  next(new appError(`can't find ${req.originalUrl} on this server!!`, 404));
});
// handleGlobalError
app.use(handelGlobalError);
export default app;
