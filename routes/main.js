const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const { ensureAuth, ensureAuthOrGuest } = require("../middleware/auth");
const { body, validationResult } = require('express-validator');

//Main Routes
router.get("/", homeController.getIndex);
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/guest", authController.enterGuestMode);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

// Protected routes - require auth OR guest session
router.get("/profile", ensureAuthOrGuest, authController.getProfile);
router.get("/profile/edit", ensureAuthOrGuest, authController.getEditProfile);
router.post("/profile/editProfile", ensureAuthOrGuest, [
  body('age').isInt({ min: 16, max: 120 }).withMessage('Age must be 16+'),
  body('income').isFloat({ min: 0 }).withMessage('Income cannot be negative'),
  body('retirementAge').isInt({ min: 18, max: 120 }).withMessage('Invalid retirement age'),
  body('state').notEmpty().withMessage('State is required')
], authController.postEditProfile);
router.get("/tracker", ensureAuthOrGuest, authController.getTracker);  
router.post("/tracker", ensureAuthOrGuest, authController.postTracker);
router.post("/tracker/delete/:id", ensureAuthOrGuest, authController.deleteTransaction);

// OAuth Routes
router.get("/auth/google", authController.googleAuth);
router.get("/auth/google/callback", authController.googleAuthCallback);

module.exports = router;