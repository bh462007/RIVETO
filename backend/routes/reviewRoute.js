import express from "express";
import {
  addReview,
  getProductReviews,
} from "../controller/reviewController.js";

import authUser from "../middleware/isAuth.js";

const reviewRouter = express.Router();

reviewRouter.post("/add", authUser, addReview);

reviewRouter.get("/:productId", getProductReviews);

export default reviewRouter;
