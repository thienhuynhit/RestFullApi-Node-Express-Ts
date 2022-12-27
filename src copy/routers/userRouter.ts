import express from 'express';
import { deleteMe, getAllUsers, updateMe } from '../controllers/userController';
import { forgotPassword, login, protect, resetPassword, signup, updatePassword } from '../controllers/authController';

const userRouter = express.Router();

userRouter.post('/signup', signup);
userRouter.post('/login', login);

userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:token', resetPassword);

userRouter.patch('/updateMyPassword', protect, updatePassword);
userRouter.patch('/updateMe', protect, updateMe);
userRouter.delete('/deleteMe', protect, deleteMe);

userRouter.route('/').get(protect, getAllUsers);

export default userRouter;
