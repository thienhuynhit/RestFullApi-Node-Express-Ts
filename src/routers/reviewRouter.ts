import express from 'express';
import { protect, restrictTo } from '../controllers/authController';
import { createReview, deleteReviewById, getAllReviews, getReviewById, updateReviewById } from '../controllers/reviewController';

// must set merge params de enable nested route
const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(protect);
reviewRouter.route('/').get(getAllReviews).post(restrictTo('user', 'admin'), createReview);
reviewRouter.route('/:id').get(getReviewById).patch(restrictTo('user'), updateReviewById).delete(restrictTo('user', 'admin'), deleteReviewById);
export default reviewRouter;
