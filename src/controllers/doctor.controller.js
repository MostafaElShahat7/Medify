const { put, del } = require('@vercel/blob');
const Doctor = require("../models/doctor.model");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Post = require("../models/post.model");
const Appointment = require("../models/appointment.model");
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
    // Validate availability data
    await availabilitySchema.validate({ availability });

    const result = await Doctor.updateOne(
      { _id: doctorId },
      { $set: { availability } }
    );
    
    if (result.nModified === 0) {
      return res.status(404).send("Doctor not found or no changes made.");
    }
    
    res.status(200).json({
      message: "Availability updated successfully for " + doctorId,
      availability: availability,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors
      });
    }
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
    console.log('=== Create Post Debug ===');
    console.log('Request Body:', req.body);
    console.log('Content:', req.body.content);
    console.log('File:', req.file);
    console.log('User:', req.user);
    console.log('========================');

    // Fix: Get doctorId correctly from user object
    const doctorId = req.user._id || req.user._doc._id;
    
    if (!doctorId) {
      console.error('Doctor ID not found in:', req.user);
      return res.status(400).json({
        message: "Could not determine doctor ID",
        user: req.user
      });
    }

    const postData = {
      doctorId: doctorId,
      content: req.body.content
    };

    // Handle image upload if exists
    if (req.file) {
      try {
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

    console.log('Creating post with data:', postData);
    const newPost = new Post(postData);
    await newPost.save();
    
    // Get the doctor name for the response
    const doctor = await Doctor.findById(doctorId).select('name');
    
    // Create a new object with the populated post data (excluding likes)
    const populatedPost = newPost.toObject();
    delete populatedPost.likes; // Remove likes field from response
    populatedPost.doctorName = doctor ? doctor.name : 'Unknown';
    
    // Format the date to be more readable
    if (populatedPost.createdAt) {
      const date = new Date(populatedPost.createdAt);
      populatedPost.formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    res.status(201).json({
      message: "Post created successfully",
      post: populatedPost
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ 
      message: "Error creating post",
      error: error.message
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

    // Get the doctor name for the response
    const doctor = await Doctor.findById(doctorId).select('name');
    
    // Create a new object with the populated post data (excluding likes)
    const populatedPost = post.toObject();
    delete populatedPost.likes; // Remove likes field from response
    populatedPost.doctorName = doctor ? doctor.name : 'Unknown';

    // Format the date to be more readable
    if (populatedPost.createdAt) {
      const date = new Date(populatedPost.createdAt);
      populatedPost.formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    res.json({
      message: "Post updated successfully",
      post: populatedPost
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
    .select("content image createdAt");

  // Add the doctor name to each post
  const postsWithDoctorName = posts.map(post => {
    const postObj = post.toObject();
    postObj.doctorName = doctor.name;
    
    // Format the date to be more readable
    if (postObj.createdAt) {
      const date = new Date(postObj.createdAt);
      postObj.formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return postObj;
  });

  res.status(200).json({
    doctor,
    posts: postsWithDoctorName,
  });
});

// Get doctor availability by ID (for patients to view)
const getDoctorAvailabilityById = catchAsync(async (req, res) => {
  const { doctorId } = req.params;

  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    res.status(200).json({
      doctorId: doctor._id,
      doctorName: doctor.name,
      availability: doctor.availability
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving doctor availability", 
      error: error.message 
    });
  }
});

// New function to get all posts from all doctors
const getAllPosts = async (req, res) => {
  try {
    // Fetch all posts and sort by newest first
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('doctorId', 'name specialty profilePicture');
    
    // Format posts with doctor information (excluding likes)
    const formattedPosts = posts.map(post => {
      const formattedPost = post.toObject();
      delete formattedPost.likes; // Remove likes field from response
      
      // Add doctor information
      if (post.doctorId) {
        formattedPost.doctorName = post.doctorId.name || 'Unknown';
        formattedPost.doctorSpecialty = post.doctorId.specialty || '';
        formattedPost.doctorProfilePicture = post.doctorId.profilePicture || null;
      } else {
        formattedPost.doctorName = 'Unknown';
        formattedPost.doctorSpecialty = '';
        formattedPost.doctorProfilePicture = null;
      }
      
      // Format date
      if (formattedPost.createdAt) {
        const date = new Date(formattedPost.createdAt);
        formattedPost.formattedDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      return formattedPost;
    });
    
    res.status(200).json({
      message: "Posts retrieved successfully",
      posts: formattedPosts
    });
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res.status(500).json({ 
      message: "Error retrieving posts",
      error: error.message
    });
  }
};

// Get available time slots for a doctor on a specific day
const getAvailableTimeSlots = catchAsync(async (req, res) => {
  const { doctorId, date } = req.params;
  
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
    
    const availableSlot = doctor.availability.find(slot => slot.dayOfWeek === dayOfWeek);
    
    if (!availableSlot) {
      return res.status(200).json({
        message: "Doctor is not available on this day",
        availableSlots: []
      });
    }

    // Get all time slots between start and end time
    const { getTimeSlots, convert24To12Hour } = require('../utils/time.util');
    const allSlots = getTimeSlots(availableSlot.startTime, availableSlot.endTime, 60);
    
    // Filter out booked slots
    const bookedSlots = availableSlot.bookedSlots || [];
    const availableSlots = allSlots.filter(slot => {
      return !bookedSlots.some(bookedSlot => {
        const { isTimeWithinRange } = require('../utils/time.util');
        return isTimeWithinRange(slot, bookedSlot.startTime, bookedSlot.endTime);
      });
    });

    // Convert to 12-hour format for display
    const formattedSlots = availableSlots.map(slot => ({
      time: convert24To12Hour(slot),
      time24: slot
    }));

    res.status(200).json({
      doctorId: doctor._id,
      doctorName: doctor.name,
      date: date,
      dayOfWeek: dayOfWeek,
      availableSlots: formattedSlots,
      totalSlots: formattedSlots.length
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving available time slots", 
      error: error.message 
    });
  }
});

// Upload doctor verification image
const uploadVerificationImage = async (req, res) => {
  try {
    const doctorId = req.user._id || req.user._doc?._id;
    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID not found" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }
    const timestamp = Date.now();
    const uniqueFilename = `verification-${doctorId}-${timestamp}-${req.file.originalname}`;
    const blob = await put(uniqueFilename, req.file.buffer, {
      access: 'public',
      addRandomSuffix: true
    });
    // Update doctor profile with verification image URL
    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { verificationImage: blob.url },
      { new: true }
    );
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(200).json({
      message: "Verification image uploaded successfully",
      verificationImage: blob.url
    });
  } catch (error) {
    console.error("Error uploading verification image:", error);
    res.status(500).json({
      message: "Error uploading verification image",
      error: error.message
    });
  }
};

// Upload doctor profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    const doctorId = req.user._id || req.user._doc?._id;
    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID not found" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }
    const timestamp = Date.now();
    const uniqueFilename = `profile-${doctorId}-${timestamp}-${req.file.originalname}`;
    const blob = await put(uniqueFilename, req.file.buffer, {
      access: 'public',
      addRandomSuffix: true
    });
    // Update doctor profile with profile picture URL
    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { profilePicture: blob.url },
      { new: true }
    );
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePicture: blob.url
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({
      message: "Error uploading profile picture",
      error: error.message
    });
  }
};

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
  getDoctorAvailabilityById,
  getAllPosts,
  getAvailableTimeSlots,
  uploadVerificationImage,
  uploadProfilePicture,
};
