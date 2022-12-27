import catchAsync from '../utils/catchAsync';
import reviewModel from '../models/reviewModel';
import appError from '../utils/appError';

export const getAllReviews = catchAsync(async (req: any, res: any, next: any) => {
  let filter = {};
  if (req.params.bookId) filter = { book: req.params.bookId };
  const reviews = await reviewModel.find(filter);
  res.status(200).json({ status: 'successful', length: reviews.length, data: reviews });
});

// implementing nested route de the hien moi quan he giua cac document book user review voi thong tin user da dang nhap
// GET book/abc123/review day la get all review cua 1 book
// GET book/abc123/review/123bac day la get 1 review co id cu the cua book cu the
// POST book/abcd123/review create review cua 1 book cu the
export const createReview = catchAsync(async (req: any, res: any, next: any) => {
  if (!req.body.book) req.body.book = req.params.bookId;
  if (!req.body.user) req.body.user = req.user.id;

  const review = await reviewModel.create(req.body);
  res.status(200).json({ status: 'successful', data: req.body });
});

export const getReviewById = catchAsync(async (req: any, res: any, next: any) => {
  const review = await reviewModel.findById(req.params.id);
  if (!review) {
    return next(new appError('No document found with that ID', 404));
  }
  res.status(200).json({ status: 'successful', data: review });
});

export const updateReviewById = catchAsync(async (req: any, res: any, next: any) => {
  const review = await reviewModel.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true });
  if (!review) {
    return next(new appError('No document found with that ID', 404));
  }
  res.status(200).json({ status: 'successful', data: review });
});

export const deleteReviewById = catchAsync(async (req: any, res: any, next: any) => {
  const review = await reviewModel.findByIdAndDelete(req.params.id);
  if (!review) {
    return next(new appError('No document found with that ID', 404));
  }
  res.status(204).json({ status: 'successful', data: review });
});
