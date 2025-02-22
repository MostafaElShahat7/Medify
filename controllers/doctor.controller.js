const Doctor = require("../models/doctor.model");
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
  const token = req.headers.authorization.split(' ')[1]; 
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

  const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const doctorId = decoded.id; 

    const updatedData = req.body; 

    try {
        const result = await Doctor.findByIdAndUpdate(doctorId, updatedData, { new: true }); // تحديث بيانات الدكتور
        if (!result) {
            return res.status(404).send("Doctor not found.");
        }
        res.status(200).json(result); 
    } catch (error) {
        res.status(500).send("Error updating profile: " + error.message);
    }
});

const getDoctorAvailability = catchAsync(async (req, res) => {
  const token = req.headers.authorization.split(' ')[1]; 
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
  const token = req.headers.authorization.split(' ')[1]; 
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
const updatePost = catchAsync(async (req, res) => {
  const post = await Post.findOne({
    _id: req.params.postId,
    doctorId: req.user.id,
  });

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  post.content = req.body.content;
  if (req.file) {
    post.image = req.file.path;
  }

  await post.save();

  res.json({
    message: "Post updated successfully",
    post,
  });
});

const deletePost = catchAsync(async (req, res) => {
  const post = await Post.findOneAndDelete({
    _id: req.params.postId,
    doctorId: req.user.id,
  });

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  res.json({ message: "Post deleted successfully" });
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
};
