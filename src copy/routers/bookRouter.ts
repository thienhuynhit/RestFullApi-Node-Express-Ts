import express from 'express';
// import { createReview, getAllReviews } from '../controllers/reviewController';
import { protect, restrictTo } from '../controllers/authController';
import { createBook, deleteBookById, getAllBooks, getBookById, getBookStats, getTopRateBooks, updateBookById } from '../controllers/bookController';
import reviewRouter from './reviewRouter';

const bookRouter: express.Router = express.Router();
// nested route
bookRouter.use('/:bookId/review', reviewRouter);

bookRouter.route('/book-stats').get(getBookStats);
bookRouter.route('/top-rate-books').get(getTopRateBooks, getAllBooks);
bookRouter.route('/').get(protect, getAllBooks).post(createBook);
bookRouter.route('/:id').get(getBookById).patch(updateBookById).delete(protect, restrictTo('admin', 'lead-store'), deleteBookById);

// implementing nested route de the hien moi quan he giua cac document book user review voi thong tin user da dang nhap
// GET book/abc123/review day la get all review cua 1 book
// GET book/abc123/review/123bac day la get 1 review co id cu the cua book cu the
// POST book/abcd123/review create review cua 1 book cu the
// bookRouter.route('/:bookId/review').get(protect, getAllReviews).post(protect, restrictTo('user', 'admin', 'shipper', 'lead-store'), createReview);

export default bookRouter;
