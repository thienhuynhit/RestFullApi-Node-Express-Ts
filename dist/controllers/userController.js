"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMe = exports.updateMe = exports.deleteUserById = exports.getMe = exports.getUserById = exports.getAllUsers = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const userModel_1 = __importDefault(require("../models/userModel"));
const appError_1 = __importDefault(require("../utils/appError"));
const filterObj = (obj, ...allowedFields) => {
    let newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el))
            newObj[el] = obj[el];
    });
    return newObj;
};
exports.getAllUsers = (0, catchAsync_1.default)(async (req, res, next) => {
    const users = await userModel_1.default.find();
    res.status(200).json({ status: 'successful', length: users.length, data: users });
});
exports.getUserById = (0, catchAsync_1.default)(async (req, res, next) => {
    const doc = await userModel_1.default.findOne({ _id: req.params.id });
    res.status(200).json({ status: 'successful', data: doc });
});
exports.getMe = (0, catchAsync_1.default)(async (req, res, next) => {
    req.params.id = req.user.id;
    next();
});
exports.deleteUserById = (0, catchAsync_1.default)(async (req, res, next) => {
    const doc = await userModel_1.default.findByIdAndDelete({ _id: req.params.id });
    res.status(204).json({ status: 'successful', data: doc });
});
exports.updateMe = (0, catchAsync_1.default)(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(new appError_1.default('This route is not for password updates. Please use /updateMyPassword.', 400));
    }
    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await userModel_1.default.findByIdAndUpdate(req.user.id, filteredBody, { runValidators: true, new: true });
    res.status(200).json({ status: 'successful', data: updatedUser });
});
exports.deleteMe = (0, catchAsync_1.default)(async (req, res, next) => {
    await userModel_1.default.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({ status: 'done', data: null });
});
//# sourceMappingURL=userController.js.map