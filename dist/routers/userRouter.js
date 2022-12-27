"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authController_1 = require("../controllers/authController");
const userRouter = express_1.default.Router();
userRouter.post('/signup', authController_1.signup);
userRouter.post('/login', authController_1.login);
userRouter.post('/forgotPassword', authController_1.forgotPassword);
userRouter.patch('/resetPassword/:token', authController_1.resetPassword);
userRouter.use(authController_1.protect);
userRouter.patch('/updateMyPassword', authController_1.updatePassword);
userRouter.patch('/updateMe', userController_1.updateMe);
userRouter.route('/me').get(userController_1.getMe, userController_1.getUserById);
userRouter.delete('/deleteMe', (0, authController_1.restrictTo)('user'), userController_1.deleteMe);
userRouter.use((0, authController_1.restrictTo)('lead-store', 'admin'));
userRouter.route('/').get(userController_1.getAllUsers);
userRouter.route('/:id').get(userController_1.getUserById).delete(userController_1.deleteUserById);
exports.default = userRouter;
//# sourceMappingURL=userRouter.js.map