import mongoose, { Schema } from 'mongoose';

interface IReview {
  review: string;
  rating: number;
  createdAt: Date | number;
  book: any;
  user: any;
}

const reviewSchema = new mongoose.Schema<IReview>(
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

// populate review thuc thi o child referencing
// luu y khi populate virtual o phia parent referencing chay thi no se chay o day nua
reviewSchema.pre(/^find/, function (next) {
  // console.log('da chay vao populate review phia child referencing');
  // this.populate({ path: 'book', select: 'name -shippers' }).populate({ path: 'user', select: '-__v' });
  this.populate({ path: 'user', select: '-__v' });
  next();
});

const reviewModel = mongoose.model('review', reviewSchema);

export default reviewModel;
