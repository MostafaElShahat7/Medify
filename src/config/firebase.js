const admin = require("firebase-admin");
const path = require("path");

const initializeFirebase = () => {
  try {
    if (process.env.NODE_ENV === "production") {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        })
      });
    } else {
    }
    console.log("Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
  }
};

module.exports = { initializeFirebase };
