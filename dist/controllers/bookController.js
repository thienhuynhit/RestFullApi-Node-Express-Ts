"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistances = exports.getBookWithin = exports.getBookStats = exports.deleteBookById = exports.updateBookById = exports.createBook = exports.getBookById = exports.getAllBooks = exports.getTopRateBooks = void 0;
const bookModel_1 = require("../models/bookModel");
const apiFeatures_1 = __importDefault(require("../utils/apiFeatures"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const appError_1 = __importDefault(require("../utils/appError"));
const getTopRateBooks = (req, res, next) => {
    req.query.sort = '-rating';
    req.query.fields = 'name,autor,description,price,rating';
    req.query.limit = '5';
    next();
};
exports.getTopRateBooks = getTopRateBooks;
exports.getAllBooks = (0, catchAsync_1.default)(async (req, res, next) => {
    const features = new apiFeatures_1.default(bookModel_1.bookModel.find(), req.query).filter().sort().limit().paginate();
    const dataBooks = await features.query;
    if (!dataBooks) {
        return next(new appError_1.default('no books found', 404));
    }
    res.status(200).json({ status: 'Successful', message: { length: dataBooks.length, data: dataBooks } });
});
exports.getBookById = (0, catchAsync_1.default)(async (req, res, next) => {
    const id = req.params.id;
    const data = await bookModel_1.bookModel.findById(id).populate({ path: 'reviews' });
    if (!data) {
        return next(new appError_1.default('no books found with this id', 404));
    }
    res.status(200).json({ status: 'successful', data: data });
});
exports.createBook = (0, catchAsync_1.default)(async (req, res, next) => {
    const newBook = req.body;
    console.log('data da nhan', req.body);
    const data = await bookModel_1.bookModel.create(newBook);
    res.status(201).json({ status: 'successful', data: data });
});
exports.updateBookById = (0, catchAsync_1.default)(async (req, res, next) => {
    const id = req.params.id;
    const newBook = req.body;
    const data = await bookModel_1.bookModel.findByIdAndUpdate(id, newBook, { runValidators: true });
    if (!data) {
        return next(new appError_1.default('no book found with this id', 404));
    }
    res.status(200).json({ status: 'successful', data: data });
});
exports.deleteBookById = (0, catchAsync_1.default)(async (req, res, next) => {
    const id = req.params.id;
    const data = await bookModel_1.bookModel.findByIdAndDelete(id);
    if (!data) {
        return next(new appError_1.default('no book found with this id', 404));
    }
    res.status(204).json({ status: 'successful', data: data });
});
exports.getBookStats = (0, catchAsync_1.default)(async (req, res, next) => {
    const dataStats = await bookModel_1.bookModel.aggregate([
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
    res.status(200).json({ status: 'successful', length: dataStats.length, data: dataStats });
});
exports.getBookWithin = (0, catchAsync_1.default)(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    console.log(lat, lng);
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    console.log(radius);
    if (!lat || !lng) {
        next(new appError_1.default('Please provide latitutr and longitude in the format lat,lng.', 400));
    }
    const books = await bookModel_1.bookModel.find({
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
exports.getDistances = (0, catchAsync_1.default)(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    if (!lat || !lng) {
        next(new appError_1.default('Please provide latitutr and longitude in the format lat,lng.', 400));
    }
    const distances = await bookModel_1.bookModel.aggregate([
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
//# sourceMappingURL=bookController.js.map