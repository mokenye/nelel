const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const { ensureAuth } = require("../middleware/auth");
const { body, validationResult } = require('express-validator');

//Main Routes
router.get("/", homeController.getIndex);
router.get("/profile", ensureAuth, authController.getProfile);
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);
router.get("/profile/edit", ensureAuth, authController.getEditProfile);
router.post(
  "/profile/editProfile", 
  ensureAuth, 
  [
    body('age').isInt({ min: 16, max: 120 }).withMessage('Age must be 16+'),
    body('income').isFloat({ min: 0 }).withMessage('Income cannot be negative'),
    body('retirementAge').isInt({ min: 18, max: 120 }).withMessage('Invalid retirement age'),
    body('state').notEmpty().withMessage('State is required')
  ],
  authController.postEditProfile
);
router.get("/tracker", ensureAuth, authController.getTracker);  
router.post("/tracker", ensureAuth, authController.postTracker);
router.post("/tracker/delete/:id", ensureAuth, authController.deleteTransaction);

module.exports = router;