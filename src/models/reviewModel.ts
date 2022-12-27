import mongoose, { Schema } from 'mongoose';
import { bookModel } from './bookModel';

interface IReview extends Document {
  review: string;
  rating: number;
  createdAt: Date | number;
  book: any;
  user: any;
}
interface IReviewMethods extends IReview {
  calcAvgRatings: (bookId: string) => void;
}
const reviewSchema = new mongoose.Schema<IReviewMethods>(
  {
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
      type: Schema.Types.ObjectId,
      ref: 'bookstore',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// to prevent duplicate review that means each user can only give one review for each book
reviewSchema.index({ book: 1, user: 1 }, { unique: true });

// populate review thuc thi o child referencing
// luu y khi populate virtual o phia parent referencing chay thi no se chay o day nua
reviewSchema.pre(/^find/, function (next) {
  // console.log('da chay vao populate review phia child referencing');
  // this.populate({ path: 'book', select: 'name -shippers' }).populate({ path: 'user', select: '-__v' });
  this.populate({ path: 'user', select: '-__v' });
  next();
});

// static method khac voi instance methong cua mongoose la co the su dung truc tiep ko can phai la method class
reviewSchema.statics.calcAvgRatings = async function (bookId) {
  const stat = await this.aggregate([
    { $match: { book: bookId } },
    { $group: { _id: '$book', nRating: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
  ]);
  // console.log(stat);
  if (stat.length > 0) {
    // we save nrating and avgRating into DB of each book
    await bookModel.findByIdAndUpdate(bookId, { rating: stat[0].avgRating, nRating: stat[0].nRating });
  } else {
    // we save nrating and avgRating into DB of each book
    await bookModel.findByIdAndUpdate(bookId, { rating: 4.5, nRating: 0 });
  }
};
// defind post save middleware to khi moi lan tao review moi se tinh lai avgRating va luu vao Db cua book do
reviewSchema.post('save', function () {
  (this.constructor as any).calcAvgRatings(this.book);
});

// findByIdAndUpdate
// findByIdAndDelete
// ca 2 function tren laf shorthand cua findOneAnd...
// define pre middleware to query
reviewSchema.pre(/^findOneAnd/, async function (next) {
  (this as any).r = await this.findOne().clone().exec();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  // console.log('vao day sau ne');
  // console.log((this as any).r.book);
  const r = (this as any).r;
  (r.constructor as any).calcAvgRatings((this as any).r.book);
});
const reviewModel = mongoose.model<IReviewMethods>('review', reviewSchema);

export default reviewModel;
