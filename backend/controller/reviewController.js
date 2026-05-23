import Review from "../model/reviewModel.js";
import Product from "../model/productModel.js";
import User from "../model/userModel.js";

export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const newReview = new Review({
      userId: req.userId,
      productId,
      name: user.name,
      rating,
      comment,
    });

    await newReview.save();

    // update product rating
    const reviews = await Review.find({ productId });

    const avgRating =
      reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: parseFloat(avgRating.toFixed(1)),
      reviewCount: reviews.length,
    });

    res.status(201).json({
      message: "Review added successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
    }).sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
