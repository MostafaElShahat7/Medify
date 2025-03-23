const Doctor = require("../models/doctor.model");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Post = require("../models/post.model");
const {
  doctorSchema,
  availabilitySchema,
} = require("../validators/doctor.validator");
const { catchAsync } = require("../utils/error.util");

const createDoctorProfile = catchAsync(async (req, res) => {
  await doctorSchema.validate(req.body);

  const existingProfile = await Doctor.findOne({ userId: req.user.id });
  if (existingProfile) {
    return res.status(400).json({ message: "Doctor profile already exists" });
  }

  const doctor = new Doctor({
    ...req.body,
    userId: req.user.id,
  });
  await doctor.save();

  res.status(201).json({
    message: "Doctor profile created successfully",
    doctor,
  });
});

const getDoctorProfile = catchAsync(async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const doctorId = decoded.id;

  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).send("Doctor not found.");
    }
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).send("Error retrieving profile: " + error.message);
  }
});

const updateDoctorProfile = catchAsync(async (req, res) => {
  await doctorSchema.validate(req.body);

  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const doctorId = decoded.id;

  const updatedData = req.body;

  try {
    const result = await Doctor.findByIdAndUpdate(doctorId, updatedData, {
      new: true,
    }); // تحديث بيانات الدكتور
    if (!result) {
      return res.status(404).send("Doctor not found.");
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send("Error updating profile: " + error.message);
  }
});

const getDoctorAvailability = catchAsync(async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const doctorId = decoded.id;

  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).send("Doctor not found.");
    }
    res.status(200).json(doctor.availability);
  } catch (error) {
    res.status(500).send("Error retrieving availability: " + error.message);
  }
});

const updateAvailability = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const doctorId = decoded.id;
  const availability = req.body.availability;

  try {
    const result = await Doctor.updateOne(
      { _id: doctorId },
      { $set: { availability } }
    );
    if (result.nModified === 0) {
      return res.status(404).send("Doctor not found or no changes made.");
    }
    res.status(200).json({
      message: "Availability updated successfully For " + doctorId,
      availability: Doctor.availability,
    });
  } catch (error) {
    res.status(500).send("Error updating availability: " + error.message);
  }
};

const getDoctorPatients = catchAsync(async (req, res) => {
  const appointments = await Appointment.find({ doctorId: req.user.id })
    .populate("patientId", "name")
    .distinct("patientId");

  res.json(appointments);
});

const createPost = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const doctorId = decoded.id;

  const postData = {
    doctorId: doctorId,
    title: req.body.title,
    content: req.body.content,
  };

  try {
    const newPost = new Post(postData);
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).send("Error creating post: " + error.message);
  }
};
const updatePost = async (req, res) => {
  try {
    const { id } = req.params; // معرف المنشور
    const { content, image } = req.body;
    const doctorId = req.user._doc._id; // معرف الدكتور من التوكن

    // البحث عن المنشور
    const post = await Post.findById(id);

    // التحقق من وجود المنشور
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // التحقق من أن الدكتور هو صاحب المنشور
    if (post.doctorId.toString() !== doctorId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this post" });
    }

    // التحقق من وجود محتوى للتحديث
    if (!content && !image) {
      return res
        .status(400)
        .json({ message: "No content provided for update" });
    }

    // تحديث المحتوى إذا تم توفيره
    if (content) {
      post.content = content;
    }

    // تحديث الصورة إذا تم توفيرها
    if (image) {
      post.image = image;
    }

    // حفظ التغييرات
    await post.save();

    res.json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user._doc._id;

    // التحقق من صحة الـ ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }

    // البحث عن المنشور
    const post = await Post.findById(id);

    // التحقق من وجود المنشور
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // التحقق من أن الدكتور هو صاحب المنشور
    if (post.doctorId.toString() !== doctorId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    // حذف المنشور
    await Post.findByIdAndDelete(id);

    res.json({
      message: "Post deleted successfully",
      deletedPost: {
        id: post._id,
        content: post.content,
        image: post.image,
      },
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: error.message });
  }
};

const getDoctorPublicProfile = catchAsync(async (req, res) => {
  const { doctorId } = req.params;

  const doctor = await Doctor.findById(doctorId).select(
    "name specialty bio education experience"
  );

  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  const posts = await Post.find({ doctorId: doctorId })
    .sort({ createdAt: -1 })
    .select("content image createdAt likes");

  res.status(200).json({
    doctor,
    posts,
  });
});

module.exports = {
  createDoctorProfile,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAvailability,
  updateAvailability,
  getDoctorPatients,
  createPost,
  updatePost,
  deletePost,
  getDoctorPublicProfile,
};
