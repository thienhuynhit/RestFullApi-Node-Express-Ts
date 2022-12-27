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
  // const dataBooks: IBook[] = await features.query.explain(); //explain to add more information to keep track data
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
  console.log('data da nhan', req.body);
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

// getBookWithin
// de so sanh radius va tim ra cac cuon sach co o cua hang gan do trong distance
// /books-within/:distance/center/:latlng/unit/:unit
// /books-within/233/center/34.111745,-118.113491/unit/mi
export const getBookWithin = catchAsync(async (req: any, res: any, next: any) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  // 10.844803950975782, 106.76286861210968 cap so nay khi create localtion on Db thi nguoc lai
  console.log(lat, lng);
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  console.log(radius);
  if (!lat || !lng) {
    next(new appError('Please provide latitutr and longitude in the format lat,lng.', 400));
  }

  const books = await bookModel.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  console.log(books);
  res.status(200).json({
    status: 'success',
    results: books.length,
    data: {
      data: books,
    },
  });
});

// getdistances tu vi tri cung cap
export const getDistances = catchAsync(async (req: any, res: any, next: any) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(new appError('Please provide latitutr and longitude in the format lat,lng.', 400));
  }

  const distances = await bookModel.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
