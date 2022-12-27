import express from 'express';
import { protect, restrictTo } from '../controllers/authController';
import { createReview, getAllReviews } from '../controllers/reviewController';

// must set merge params de enable nested route
const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.route('/').get(protect, getAllReviews).post(protect, restrictTo('user', 'admin'), createReview);

export default reviewRouter;
