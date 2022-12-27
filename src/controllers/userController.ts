import catchAsync from '../utils/catchAsync';
import userModel from '../models/userModel';
import appError from '../utils/appError';

// function filterObj de tranh user cap nhat cac truong ko muong muon
const filterObj = (obj: any, ...allowedFields: any): object => {
  let newObj: any = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// getAllUsers
export const getAllUsers = catchAsync(async (req: any, res: any, next: any) => {
  const users = await userModel.find();
  res.status(200).json({ status: 'successful', length: users.length, data: users });
});
// getUserById
export const getUserById = catchAsync(async (req: any, res: any, next: any) => {
  const doc = await userModel.findOne({ _id: req.params.id });
  res.status(200).json({ status: 'successful', data: doc });
});

// getMe lay data cua chinh user da dang nhap
export const getMe = catchAsync(async (req: any, res: any, next: any) => {
  req.params.id = req.user.id;
  next();
});

// deleteUserById
export const deleteUserById = catchAsync(async (req: any, res: any, next: any) => {
  const doc = await userModel.findByIdAndDelete({ _id: req.params.id });
  res.status(204).json({ status: 'successful', data: doc });
});

// updateMe
export const updateMe = catchAsync(async (req: any, res: any, next: any) => {
  // 1.neu user posted password or passwordConfirm thi throw new error
  if (req.body.password || req.body.passwordConfirm) {
    return next(new appError('This route is not for password updates. Please use /updateMyPassword.', 400));
  }
  // filter cac fields tranh user update role bang cach chi cho update cac fields nao da chi dinh
  const filteredBody = filterObj(req.body, 'name', 'email');
  // findByIdAndUpdate
  const updatedUser = await userModel.findByIdAndUpdate(req.user.id, filteredBody, { runValidators: true, new: true });
  res.status(200).json({ status: 'successful', data: updatedUser });
});

// deleteMe idea is we will set a new property active that can allow user to set inactive thier account
export const deleteMe = catchAsync(async (req: any, res: any, next: any) => {
  await userModel.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({ status: 'done', data: null });
});
