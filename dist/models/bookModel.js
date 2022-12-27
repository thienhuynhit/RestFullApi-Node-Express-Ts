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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const bookSchema = new mongoose_1.default.Schema({
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
        set: (val) => Math.round(val * 10) / 10,
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
            type: mongoose_1.Schema.Types.ObjectId,
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
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });
bookSchema.index({ price: 1, rating: -1 });
bookSchema.index({ slug: 1 });
bookSchema.index({ location: '2dsphere' });
bookSchema.virtual('sayHello').get(function () {
    return (this.sayHello = 'Hello everyone! Welcome to our store!!');
});
bookSchema.virtual('reviews', { ref: 'review', foreignField: 'book', localField: '_id' });
bookSchema.pre('save', function (next) {
    this.slug = (0, slugify_1.default)(this.name, { lower: true });
    next();
});
bookSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'shippers',
        select: '-__v -passwordChangedAt',
    });
    next();
});
bookSchema.pre('save', function (next) {
    this.updateAt = Date.now();
    if (!this.createAt) {
        this.createAt = Date.now();
    }
    next();
});
bookSchema.pre(/^find/, function (next) {
    this.find({ secretBook: { $ne: true } });
    next();
});
exports.bookModel = mongoose_1.default.model('bookstore', bookSchema);
//# sourceMappingURL=bookModel.js.map