"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const reviewController_1 = require("../controllers/reviewController");
const reviewRouter = express_1.default.Router({ mergeParams: true });
reviewRouter.use(authController_1.protect);
reviewRouter.route('/').get(reviewController_1.getAllReviews).post((0, authController_1.restrictTo)('user', 'admin'), reviewController_1.createReview);
reviewRouter.route('/:id').get(reviewController_1.getReviewById).patch((0, authController_1.restrictTo)('user'), reviewController_1.updateReviewById).delete((0, authController_1.restrictTo)('user', 'admin'), reviewController_1.deleteReviewById);
exports.default = reviewRouter;
//# sourceMappingURL=reviewRouter.js.map