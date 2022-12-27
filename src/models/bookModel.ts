import mongoose, { Schema } from 'mongoose';
import slugify from 'slugify';

export interface IBook extends mongoose.Document {
  name: string;
  author: string;
  description: string;
  rating: number;
  nRating: number;
  price: number;
  type: string;
  slug: string;
  discount: number;
  createAt: Date;
  updateAt: Date;
  secretBook: Boolean;
  shippers: any;
  location: {
    address: String;
    description: String;
    type: { type: String };
    coordinates: [number];
  };
}

const bookSchema: mongoose.Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: [true, 'the name should be trimed'],
      unique: [true, 'a book must have unique name'],
      required: [true, 'a book must have name'],
      default: 'Hoa Vang Tren Co Xanh',
    },
    author: {
      type: String,
      trim: [true, 'the author should be trimed'],
      required: [true, 'a book must have author'],
      default: 'Nguyen Nhat Anh',
    },
    description: {
      type: String,
      trim: [true, 'the description should be trimed'],
      minLength: [10, 'description must have at least 10 words'],
      required: [true, 'a book must have description'],
      default: 'This is new book in our shop!! you can find yourself in this story and enjoy the phase of history of Vietnam in 20 century',
    },
    rating: {
      type: Number,
      required: [true, 'a book must have rating'],
      max: [5, 'the rating must be less than or equal 5'],
      min: [0, 'the rating must be greater than or equal 0'],
      default: 4.5,
      set: (val: number) => Math.round(val * 10) / 10,
    },
    nRating: {
      type: Number,
    },
    price: {
      type: Number,
      required: [true, 'a book must have price'],
      min: [5, 'the price must be greater than 5'],
      default: 100,
    },
    discount: {
      type: Number,
      required: function () {
        return this.price > this.discount;
      },
    },
    type: {
      type: String,
      enum: {
        values: ['Novel', 'Comic', 'Book'],
        message: '{VALUE} is not supported! Please use another type',
      },
      required: [true, 'a book must have type'],
      default: 'Book',
    },
    shippers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
    createAt: {
      type: Date,
    },
    updateAt: {
      type: Date,
    },
    slug: {
      type: String,
      required: [true, 'a book must have slug'],
      default: 'new-book',
    },
    secretBook: {
      type: Boolean,
      required: [true, 'a book must be set type book'],
      default: false,
    },
    location: {
      address: String,
      description: String,
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// adding index to improve query performance
// bookSchema.index({ price: 1 }); //need to remove index on db
bookSchema.index({ price: 1, rating: -1 });
bookSchema.index({ slug: 1 });
bookSchema.index({ location: '2dsphere' });
// this will not add to DB. It just send to client
bookSchema.virtual('sayHello').get(function () {
  return (this.sayHello = 'Hello everyone! Welcome to our store!!');
});

// virtual populate de giup parent referencing co the lay gia tri cua chil referencing
bookSchema.virtual('reviews', { ref: 'review', foreignField: 'book', localField: '_id' });

// document middleware will run before document save
bookSchema.pre('save', function (next) {
  // console.log('da chay new');
  this.slug = slugify(this.name, { lower: true });
  // console.log(this.slug);
  next();
});

// khi find book thi cac child referencing book se chi chua id cua cac shipper va khi find se populate va tra ve obj cua cac shiper day du
bookSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'shippers',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// middleware thuc thi embeding
// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.shippers.map(async id => await userModel.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

bookSchema.pre('save', function (next) {
  // console.log('da chay new');
  this.updateAt = Date.now();
  if (!this.createAt) {
    this.createAt = Date.now();
  }
  next();
});
// document middleware
bookSchema.pre(/^find/, function (next) {
  this.find({ secretBook: { $ne: true } });
  // this.start = Date.now();
  next();
});
// // document middleware will run after all pre middlewares finish
// bookSchema.post(/^find/, function () {
//   const time = Date.now() - this.start;
//   console.log(`this query took ${time} miliseconds`);
// });

export const bookModel = mongoose.model<IBook>('bookstore', bookSchema);
