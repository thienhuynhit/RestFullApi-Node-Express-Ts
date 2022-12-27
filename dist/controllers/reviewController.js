"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReviewById = exports.updateReviewById = exports.getReviewById = exports.createReview = exports.getAllReviews = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const reviewModel_1 = __importDefault(require("../models/reviewModel"));
const appError_1 = __importDefault(require("../utils/appError"));
exports.getAllReviews = (0, catchAsync_1.default)(async (req, res, next) => {
    let filter = {};
    if (req.params.bookId)
        filter = { book: req.params.bookId };
    const reviews = await reviewModel_1.default.find(filter);
    res.status(200).json({ status: 'successful', length: reviews.length, data: reviews });
});
exports.createReview = (0, catchAsync_1.default)(async (req, res, next) => {
    if (!req.body.book)
        req.body.book = req.params.bookId;
    if (!req.body.user)
        req.body.user = req.user.id;
    const review = await reviewModel_1.default.create(req.body);
    res.status(200).json({ status: 'successful', data: req.body });
});
exports.getReviewById = (0, catchAsync_1.default)(async (req, res, next) => {
    const review = await reviewModel_1.default.findById(req.params.id);
    if (!review) {
        return next(new appError_1.default('No document found with that ID', 404));
    }
    res.status(200).json({ status: 'successful', data: review });
});
exports.updateReviewById = (0, catchAsync_1.default)(async (req, res, next) => {
    const review = await reviewModel_1.default.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true });
    if (!review) {
        return next(new appError_1.default('No document found with that ID', 404));
    }
    res.status(200).json({ status: 'successful', data: review });
});
exports.deleteReviewById = (0, catchAsync_1.default)(async (req, res, next) => {
    const review = await reviewModel_1.default.findByIdAndDelete(req.params.id);
    if (!review) {
        return next(new appError_1.default('No document found with that ID', 404));
    }
    res.status(204).json({ status: 'successful', data: review });
});
//# sourceMappingURL=reviewController.js.map