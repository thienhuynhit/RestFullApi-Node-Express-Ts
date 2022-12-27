import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

interface IUser extends Document {
  name: string;
  email: string;
  photo: string;
  password: string;
  passwordConfirm: string | undefined;
  passwordChangedAt: Date | undefined | number;
  role: string;
  passwordResetToken: String | undefined;
  passwordResetExpires: Date | undefined;
  active: boolean;
}
interface IUserInstanceCreation extends IUser {
  checkPassword: (password: string, userpassword: string) => Promise<boolean>;
  changedPasswordAfter: (JWTTimestamp: any) => boolean;
  createPasswordResetToken: () => string;
}

const userSchema = new mongoose.Schema<IUserInstanceCreation>({
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
      validator: function (val: any) {
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
    validate: [validator.isEmail, 'email must be validated'],
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
    validate: [validator.isStrongPassword, 'password must be validated '],
    default: 'Abcd1234@',
    select: false,
  },
  passwordConfirm: {
    type: String || undefined,
    required: [true, 'user must have passwordConfirm'],
    validate: {
      // this only work on save
      validator: function (el: any) {
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

// middleware pre find de filter cac account inactive va show len khi get
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// apply document middleware to encrypt password and the store it in DB to prevent hacker
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// create an instance method kiem tra password da duoc encrypt khi user dang nhap
userSchema.methods.checkPassword = async function (candidatePassword: string, userPassword: string) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
// add passwordChangeAt khi user request to change password
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  // sometimes the internet connection is bad that can lead to a bug. So we minus 1s
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// check change pasword after login
userSchema.methods.changedPasswordAfter = function (JWTTimestamp: any): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp: number = parseInt(this.passwordChangedAt.getTime(), 10) / 1000;
    // console.log(JWTTimestamp < changedTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

// createPasswordResetToken tao resetToken khi ma co request doi password tu client bang post request with email
userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const userModel = mongoose.model<IUserInstanceCreation>('user', userSchema);

export default userModel;
