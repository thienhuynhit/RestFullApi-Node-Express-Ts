import express from 'express';
import { deleteMe, deleteUserById, getAllUsers, getMe, getUserById, updateMe } from '../controllers/userController';
import { forgotPassword, login, protect, resetPassword, restrictTo, signup, updatePassword } from '../controllers/authController';

const userRouter = express.Router();

// every user and guest can do these actions
userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:token', resetPassword);

// apply protect authentication for below route
userRouter.use(protect);

userRouter.patch('/updateMyPassword', updatePassword);
userRouter.patch('/updateMe', updateMe);
userRouter.route('/me').get(getMe, getUserById);
userRouter.delete('/deleteMe', restrictTo('user'), deleteMe);

// only lead-store and admin can do these actions
userRouter.use(restrictTo('lead-store', 'admin'));

userRouter.route('/').get(getAllUsers);
userRouter.route('/:id').get(getUserById).delete(deleteUserById);

export default userRouter;
