import catchAsync from '../utils/catchAsync';
import reviewModel from '../models/reviewModel';

export const getAllReviews = catchAsync(async (req: any, res: any, next: any) => {
  let filter = {};
  if (req.params.bookId) filter = { book: req.params.bookId };
  const reviews = await reviewModel.find(filter);
  res.status(200).json({ status: 'successful', length: reviews.length, data: reviews });
});

export const createReview = catchAsync(async (req: any, res: any, next: any) => {
  if (!req.body.book) req.body.book = req.params.bookId;
  if (!req.body.user) req.body.user = req.user.id;

  const review = await reviewModel.create(req.body);
  res.status(200).json({ status: 'successful', data: req.body });
});
