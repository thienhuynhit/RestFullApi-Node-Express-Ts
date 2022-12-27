import { bookModel, IBook } from '../models/bookModel';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import apiFeatures from '../utils/apiFeatures';
import catchAsync from '../utils/catchAsync';
import appError from '../utils/appError';
// getTopRateBooks
export const getTopRateBooks: RequestHandler = (req, res, next) => {
  req.query.sort = '-rating';
  req.query.fields = 'name,autor,description,price,rating';
  req.query.limit = '5';
  next();
};

// getAllBooks
export const getAllBooks: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const features = new apiFeatures(bookModel.find(), req.query).filter().sort().limit().paginate();
  // EXECUTE
  const dataBooks: IBook[] = await features.query;
  // throw error when got rejection
  if (!dataBooks) {
    return next(new appError('no books found', 404));
  }
  res.status(200).json({ status: 'Successful', message: { length: dataBooks.length, data: dataBooks } });
});

// getBookById
export const getBookById: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const data = await bookModel.findById(id).populate({ path: 'reviews' });

  // throw error when got rejection
  if (!data) {
    return next(new appError('no books found with this id', 404));
  }
  res.status(200).json({ status: 'successful', data: data });
});

// createBook
export const createBook: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const newBook = req.body;
  const data = await bookModel.create(newBook);
  // we will handle error validate DB
  res.status(201).json({ status: 'successful', data: data });
});

// updateBookById
export const updateBookById: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const newBook = req.body;
  const data = await bookModel.findByIdAndUpdate(id, newBook, { runValidators: true });
  // throw error when got rejection
  if (!data) {
    return next(new appError('no book found with this id', 404));
  }
  res.status(200).json({ status: 'successful', data: data });
});

// deleteBookById
export const deleteBookById: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const data = await bookModel.findByIdAndDelete(id);
  // throw error when got rejection
  if (!data) {
    return next(new appError('no book found with this id', 404));
  }
  res.status(204).json({ status: 'successful', data: data });
});

// getBookStats
export const getBookStats: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const dataStats = await bookModel.aggregate([
    {
      $match: {
        rating: { $gte: 3.5 },
      },
    },
    {
      $group: {
        _id: { $toUpper: '$type' },
        numberBooks: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        avgRating: { $avg: '$rating' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);
  // // throw error when got rejection
  // if (!dataStats) {
  //   return next(new appError('no books found with pipeline', 404));
  // }
  res.status(200).json({ status: 'successful', length: dataStats.length, data: dataStats });
});
