const express = require("express");
const router = express.Router();
const { authenticateDoctor, authorize } = require("../middleware/auth.middleware");
const {
  createReview,
  getDoctorReviews,
  updateReview,
  deleteReview
} = require("../controllers/review.controller");

router.use(authenticateDoctor);

router.post("/:doctorId", authorize("patient"), createReview);
router.get("/doctor/:doctorId", getDoctorReviews);
router.put("/:reviewId", authorize("patient"), updateReview);
router.delete("/:reviewId", authorize("patient"), deleteReview);

module.exports = router;
