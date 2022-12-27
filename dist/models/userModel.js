"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'user must have a name!!'],
        trim: true,
        default: 'guest',
    },
    role: {
        type: String || undefined,
        required: [true, 'everyone must have role to authorization'],
        validate: {
            validator: function (val) {
                console.log(val);
                return ['user', 'admin', 'lead-store', 'shipper'].includes(val);
            },
            message: '{VALUE} no support! please provide another value',
        },
        default: 'user',
    },
    email: {
        type: String,
        required: [true, 'user must have email'],
        trim: true,
        unique: true,
        lowercase: true,
        validate: [validator_1.default.isEmail, 'email must be validated'],
        default: 'abc@gmail.com',
    },
    photo: {
        type: String,
        required: [true, 'user must have photo'],
        default: 'src/public/hinh.img',
    },
    password: {
        type: String,
        required: [true, 'user must have password'],
        validate: [validator_1.default.isStrongPassword, 'password must be validated '],
        default: 'Abcd1234@',
        select: false,
    },
    passwordConfirm: {
        type: String || undefined,
        required: [true, 'user must have passwordConfirm'],
        validate: {
            validator: function (el) {
                return this.password === el;
            },
            message: 'password are not the same',
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: { type: Boolean, select: false, default: true },
});
userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    this.password = await bcryptjs_1.default.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});
userSchema.methods.checkPassword = async function (candidatePassword, userPassword) {
    return await bcryptjs_1.default.compare(candidatePassword, userPassword);
};
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew)
        return next();
    this.passwordChangedAt = new Date(Date.now() - 1000);
    next();
});
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime(), 10) / 1000;
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
    console.log({ resetToken }, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};
const userModel = mongoose_1.default.model('user', userSchema);
exports.default = userModel;
//# sourceMappingURL=userModel.js.map