import { RequestHandler } from 'express';
import catchAsync from '../utils/catchAsync';
import userModel from '../models/userModel';
import jwt from 'jsonwebtoken';
import appError from '../utils/appError';
import { promisify } from 'util';
import sendEmail from '../utils/email';
import crypto from 'crypto';
//  tao token
const signToken = (id: any) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
};

// gui token va res ||best practise is only store token or resetToken on cookie httponly
const createSendToken = (user: any, statusCode: any, res: any) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: false,
  };
  // chay tren https thi bat secure
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const signup: RequestHandler = catchAsync(async (req: any, res: any, next: any) => {
  const newUser = await userModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });
  createSendToken(newUser, 201, res);
});

export const login: RequestHandler = catchAsync(async (req: any, res: any, next: any) => {
  const { email, password } = req.body;
  //1. check email and password
  if (!email || !password) {
    return next(new appError('please provide email and password!!', 400));
  }
  // 2. find the user exist
  const user = await userModel.findOne({ email: email }).select('+password');
  const check = new userModel();
  if (!user || !(await check.checkPassword(password, user.password))) {
    return next(new appError('Password or Email wrong', 401));
  }
  // 3. we will res token to client if true
  createSendToken(user, 200, res);
});

// dam bao phai dang nhap xong moi dc thuc hien
export const protect: RequestHandler = catchAsync(async (req: any, res: any, next: any) => {
  // 1. getting token and check of it
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new appError('You are not logged in! Please log in to get access.', 401));
  }
  // 2. verify token
  const asyncVerify: any = promisify(jwt.verify);
  const decoded: any = await asyncVerify(token, process.env.JWT_SECRET!);
  // console.log(decoded);
  // 3. Check if user still exists
  const freshUser = await userModel.findById(decoded.id);
  if (!freshUser) {
    return next(new appError('The user belonging to this token does no longer exist. ', 401));
  }
  // 4. Check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    // console.log('chay vo roi ne');
    return next(new appError('User recently changed password! Please log in again.', 401));
  }
  //GRANT ACCESS TO PROTECTED ROUTE
  // de them 1 property cho req.user va truyen di cho middleware tiep sau
  req.user = freshUser;
  next();
});

// restrictTo dam bao phan quyen authorization
//  phai dung dang nay vi bt parameters ko dc define san
export const restrictTo = (...roles: any) => {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) {
      return next(new appError('You do not have permission to perform this action!!', 403));
    }
    next();
  };
};

// tao function de handel viec user quen password va request to resetpass
export const forgotPassword = catchAsync(async (req: any, res: any, next: any) => {
  // 1.get user based on post request from client
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new appError('There is no user with email address.', 404));
  }
  // 2.generate random resetToken
  const resetToken = user.createPasswordResetToken();
  // by pass validator de save cac fields thong qua mongoose schema middleware
  await user.save({ validateBeforeSave: false });
  // 3.send it to user'email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/user/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new appError('There was an error sending the email. Try again later!', 500));
  }
});

// resetPassword sau khi da gui link kem resetToken va url de user resetpassword
export const resetPassword = catchAsync(async (req: any, res: any, next: any) => {
  // 1) Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await userModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new appError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // thuc hien o schema pre middleware
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

// updatePassword neu user yeu cau doi
export const updatePassword = catchAsync(async (req: any, res: any, next: any) => {
  // 1) Get user from collection
  const user = await userModel.findById(req.user.id).select('+password');
  // 2) Check if POSTed current password is correct
  const check = await user!.checkPassword(req.body.passwordCurrent, user!.password);
  if (!check) {
    return next(new appError('Your current password is wrong.', 401));
  }
  // 3) If so, update password
  user!.password = req.body.password;
  user!.passwordConfirm = req.body.passwordConfirm;
  await user!.save();
  // User.findByIdAndUpdate will NOT work as intended!
  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
