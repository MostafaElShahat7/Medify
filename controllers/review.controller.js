const Review = require('../models/review.models');
const Doctor = require('../models/doctor.model');
const { reviewSchema } = require('../validators/review.validator');
const { catchAsync } = require('../utils/error.util');

const createReview = async (req, res) => {
  try {
    await reviewSchema.validate(req.body);

    const existingReview = await Review.findOne({
      doctorId: req.params.doctorId,
      patientId: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this doctor' });
    }

    const review = new Review({
      doctorId: req.params.doctorId,
      patientId: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment
    });

    await review.save();

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const getDoctorReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ doctorId: req.params.doctorId })
    .populate('patientId', 'name')
    .sort({ createdAt: -1 });

  res.json(reviews);
});

const updateReview = catchAsync(async (req, res) => {
  await reviewSchema.validate(req.body);

  const review = await Review.findOne({
    _id: req.params.reviewId,
    patientId: req.user._id
  });

  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
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
});

const deleteReview = catchAsync(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.reviewId,
    patientId: req.user._id
  });

  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  const doctorId = review.doctorId;
  await review.remove();

  // Update doctor's average rating
  await updateDoctorRating(doctorId);

  res.json({ message: 'Review deleted successfully' });
});

const updateDoctorRating = async (doctorId) => {
  const reviews = await Review.find({ doctorId });
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  await Doctor.findByIdAndUpdate(doctorId, { rating: averageRating });
};

module.exports = {
  createReview,
  getDoctorReviews,
  updateReview,
  deleteReview
};