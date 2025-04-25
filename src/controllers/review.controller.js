const Review = require('../models/review.models');
const Doctor = require('../models/doctor.model');
const { reviewSchema } = require('../validators/review.validator');
const { catchAsync } = require('../utils/error.util');

const createReview = async (req, res) => {
  try {
    await reviewSchema.validate(req.body);

    // Get the correct patient ID from user data
    const patientId = req.user._doc._id;

    const existingReview = await Review.findOne({
      doctorId: req.params.doctorId,
      patientId: patientId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this doctor' });
    }

    const review = new Review({
      doctorId: req.params.doctorId,
      patientId: patientId,
      rating: req.body.rating,
      comment: req.body.comment
    });

    await review.save();

    // Update doctor's average rating
    await updateDoctorRating(req.params.doctorId);

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create Review Error:', error);
    res.status(400).json({ 
      message: error.message,
      debug: {
        user: req.user,
        patientId: req.user?._doc?._id,
        doctorId: req.params.doctorId
      }
    });
  }
};


const getDoctorReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ doctorId: req.params.doctorId })
    .populate('patientId', 'name')
    .sort({ createdAt: -1 });

  res.json(reviews);
});

const updateReview = catchAsync(async (req, res) => {
  try {
    await reviewSchema.validate(req.body);

    const patientId = req.user._doc._id;
    
    const review = await Review.findOne({
      _id: req.params.reviewId,
      patientId: patientId
    });

    if (!review) {
      return res.status(404).json({ 
        message: 'Review not found',
        debug: {
          reviewId: req.params.reviewId,
          patientId: patientId
        }
      });
    }

    review.rating = req.body.rating;
    review.comment = req.body.comment;
    await review.save();

    // Update doctor's average rating
    await updateDoctorRating(review.doctorId);

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update Review Error:', error);
    res.status(400).json({ 
      message: error.message,
      debug: {
        reviewId: req.params.reviewId,
        patientId: req.user?._doc?._id
      }
    });
  }
});

const deleteReview = catchAsync(async (req, res) => {
  try {
    const patientId = req.user._doc._id;
    
    const review = await Review.findOne({
      _id: req.params.reviewId,
      patientId: patientId
    });

    if (!review) {
      return res.status(404).json({ 
        message: 'Review not found',
        debug: {
          reviewId: req.params.reviewId,
          patientId: patientId
        }
      });
    }

    const doctorId = review.doctorId;
    await Review.deleteOne({ _id: review._id });  // Using deleteOne instead of remove

    // Update doctor's average rating
    await updateDoctorRating(doctorId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete Review Error:', error);
    res.status(500).json({ 
      message: error.message,
      debug: {
        reviewId: req.params.reviewId,
        patientId: req.user?._doc?._id
      }
    });
  }
});

const updateDoctorRating = async (doctorId) => {
  try {
    const reviews = await Review.find({ doctorId });
    
    // حساب متوسط التقييم
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    // تحديث تقييم الدكتور
    await Doctor.findByIdAndUpdate(doctorId, { rating: parseFloat(averageRating) });

    return averageRating;
  } catch (error) {
    console.error('Update Doctor Rating Error:', error);
    throw error;
  }
};

module.exports = {
  createReview,
  getDoctorReviews,
  updateReview,
  deleteReview
};