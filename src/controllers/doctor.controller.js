const { put, del } = require('@vercel/blob');
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
  try {
    const doctorId = req.user._doc._id;
    
    // Ensure content exists in the request
    if (!req.body.content) {
      return res.status(400).json({ 
        message: "Post content is required",
        receivedBody: req.body
      });
    }

    const postData = {
      doctorId: doctorId,
      content: req.body.content
    };

    // Handle image upload to Vercel Blob if image exists
    if (req.file) {
      try {
        // Create a unique filename
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}-${req.file.originalname}`;
        
        const blob = await put(uniqueFilename, req.file.buffer, {
          access: 'public',
          addRandomSuffix: true
        });
        
        postData.image = blob.url;
      } catch (uploadError) {
        console.error("Error uploading to Vercel Blob:", uploadError);
        return res.status(500).json({ 
          message: "Error uploading image",
          error: uploadError.message 
        });
      }
    }

    const newPost = new Post(postData);
    await newPost.save();
    
    res.status(201).json({
      message: "Post created successfully",
      post: newPost
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ 
      message: "Error creating post",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, removeImage } = req.body;
    const doctorId = req.user._doc._id;

    // Validate post ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: "Invalid post ID format",
        providedId: id 
      });
    }

    // Find the post
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the doctor owns the post
    if (post.doctorId.toString() !== doctorId.toString()) {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    // Update the post data
    if (content) {
      post.content = content;
    }

    // Handle image removal if requested
    if (removeImage === 'true' && post.image) {
      try {
        // Extract blob path from URL
        const oldBlobPath = new URL(post.image).pathname.split('/').pop();
        await del(oldBlobPath);
        post.image = null; // Remove image reference from post
      } catch (deleteError) {
        console.error("Error deleting image:", deleteError);
        return res.status(500).json({ 
          message: "Error deleting image",
          error: deleteError.message 
        });
      }
    }
    // Handle new image upload if exists
    else if (req.file) {
      try {
        // Delete old image if exists
        if (post.image) {
          // Extract blob path from URL
          const oldBlobPath = new URL(post.image).pathname.split('/').pop();
          try {
            await del(oldBlobPath);
          } catch (deleteError) {
            console.error("Error deleting old image:", deleteError);
          }
        }

        // Create a unique filename
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}-${req.file.originalname}`;

        // Upload new image
        const blob = await put(uniqueFilename, req.file.buffer, {
          access: 'public',
          addRandomSuffix: true
        });
        
        post.image = blob.url;
      } catch (uploadError) {
        console.error("Error uploading to Vercel Blob:", uploadError);
        return res.status(500).json({ 
          message: "Error uploading new image",
          error: uploadError.message 
        });
      }
    }

    await post.save();

    res.json({
      message: "Post updated successfully",
      post
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ 
      message: error.message,
      details: "Make sure you're providing a valid post ID in the URL"
    });
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
