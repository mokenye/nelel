const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const User = require("../models/User");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
          return done(null, false, { msg: `Email ${email} not found.` })
        }
        if (!user.password) {
          return done(null, false, {
            msg:
              "Your account was registered using a sign-in provider. To enable password login, sign in using a provider, and then set a password under your user profile.",
          })
        }
        const isMatch = await user.comparePassword(password)
        if (isMatch) {
          return done(null, user)
        }
        return done(null, false, { msg: "Invalid email or password." })
      } catch (err) {
        return done(err)
      }
  }))

  // Google OAuth Strategy
  // Helper to generate a unique username
  async function generateUniqueUsername(displayName) {
    const base = displayName.replace(/\s+/g, '').toLowerCase();
    
    // Try the base username first
    let username = base;
    let counter = 2;

    while (await User.exists({ userName: username })) {
      username = `${base}${counter}`;
      counter++;
    }

    return username;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL || "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (user) return done(null, user);

          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            user.googleId = profile.id;
            user.displayName = profile.displayName;
            user.image = profile.photos[0].value;
            await user.save();
            return done(null, user);
          }

          user = new User({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            image: profile.photos[0].value,
            userName: await generateUniqueUsername(profile.displayName),
          });

          await user.save();
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
      
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
     try {
       const user = await User.findById(id)
       done(null, user)
     } catch (err) {
       done(err)
     }
   })
 } 