import { Router } from 'express'
import { allPins, createPin, deletePin } from '../controllers/pin.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';
const pinRouter = Router();

pinRouter.route("/create-pin").post(
    // upload.fields([
    //     {name: "pinImg", maxCount: 1}
    // ]),
    upload.single("pinImg"),
    verifyJwt,
    createPin
);
pinRouter.route("/delete-pin/:pinId").delete(verifyJwt, deletePin);
pinRouter.route("/").get(allPins);

export {pinRouter}