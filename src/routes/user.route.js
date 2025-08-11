import {Router} from 'express'
import { currentUser, getSavedPins, logInUser, logOutUser, refreshAccessToken, registerUser } from '../controllers/user.controller.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';

const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(logInUser);
userRouter.route("/logout").post(verifyJwt, logOutUser);
userRouter.route("/refresh-token").post(refreshAccessToken)
userRouter.route("/current-user").get(verifyJwt, currentUser)
userRouter.route("/saved-pins").get(verifyJwt, getSavedPins);

export {userRouter}