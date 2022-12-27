"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bookModel_1 = require("./bookModel");
const reviewSchema = new mongoose_1.default.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty!'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    book: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'bookstore',
        required: [true, 'Review must belong to a tour.'],
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'Review must belong to a user'],
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
reviewSchema.index({ book: 1, user: 1 }, { unique: true });
reviewSchema.pre(/^find/, function (next) {
    this.populate({ path: 'user', select: '-__v' });
    next();
});
reviewSchema.statics.calcAvgRatings = async function (bookId) {
    const stat = await this.aggregate([
        { $match: { book: bookId } },
        { $group: { _id: '$book', nRating: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
    ]);
    if (stat.length > 0) {
        await bookModel_1.bookModel.findByIdAndUpdate(bookId, { rating: stat[0].avgRating, nRating: stat[0].nRating });
    }
    else {
        await bookModel_1.bookModel.findByIdAndUpdate(bookId, { rating: 4.5, nRating: 0 });
    }
};
reviewSchema.post('save', function () {
    this.constructor.calcAvgRatings(this.book);
});
reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne().clone().exec();
    next();
});
reviewSchema.post(/^findOneAnd/, async function () {
    const r = this.r;
    r.constructor.calcAvgRatings(this.r.book);
});
const reviewModel = mongoose_1.default.model('review', reviewSchema);
exports.default = reviewModel;
//# sourceMappingURL=reviewModel.js.map