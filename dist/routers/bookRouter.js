"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const bookController_1 = require("../controllers/bookController");
const reviewRouter_1 = __importDefault(require("./reviewRouter"));
const bookRouter = express_1.default.Router();
bookRouter.use('/:bookId/review', reviewRouter_1.default);
bookRouter.route('/book-stats').get(bookController_1.getBookStats);
bookRouter.route('/top-rate-books').get(bookController_1.getTopRateBooks, bookController_1.getAllBooks);
bookRouter.route('/books-within/:distance/center/:latlng/unit/:unit').get(bookController_1.getBookWithin);
bookRouter.route('/distances/:latlng/unit/:unit').get(bookController_1.getDistances);
bookRouter.route('/').get(bookController_1.getAllBooks).post(authController_1.protect, (0, authController_1.restrictTo)('admin', 'lead-store'), bookController_1.createBook);
bookRouter
    .route('/:id')
    .get(bookController_1.getBookById)
    .patch(authController_1.protect, (0, authController_1.restrictTo)('admin', 'lead-store'), bookController_1.updateBookById)
    .delete(authController_1.protect, (0, authController_1.restrictTo)('admin', 'lead-store'), bookController_1.deleteBookById);
exports.default = bookRouter;
//# sourceMappingURL=bookRouter.js.map