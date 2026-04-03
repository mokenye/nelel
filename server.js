const express = require("express");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const methodOverride = require("method-override"); // allow PUT and DELETE methods in forms
const flash = require("express-flash");
const logger = require("morgan");
const connectDB = require("./config/database");
const mainRoutes = require("./routes/main");
const PORT = process.env.PORT || 2121;

//Use .env file in config folder
require("dotenv").config({ path: "./config/.env" });

// Passport config
require("./config/passport")(passport);

//Using EJS for views
app.set("view engine", "ejs");

//Static Folder
app.use(express.static("public"));

//Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Logging
app.use(logger("dev"));

//Use forms for put / delete
app.use(methodOverride("_method")); // allow PUT and DELETE methods in forms with ?_method=DELETE or ?_method=PUT

// Setup Sessions - stored in MongoDB
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.NF_NELELMONGO_MONGO_SRV || process.env.MONGODB_URI || process.env.DB_STRING,
        // dbName: 'Nelel',
        collectionName: 'sessions'
        }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Use flash messages for errors, info, ect...
app.use(flash());

//Setup Routes For Which The Server Is Listening
app.use("/", mainRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404);
  if (req.accepts('html')) return res.render('404', { url: req.originalUrl });
  if (req.accepts('json')) return res.json({ error: 'Not found' });
  return res.type('txt').send('Not found');
});

// Generic error handler (defensive; avoids rendering missing views)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500);
  if (req.accepts('html')) return res.send(`<h1>Server Error</h1><pre>${err.message}</pre>`);
  if (req.accepts('json')) return res.json({ error: err.message });
  return res.type('txt').send('Server error');
});

// Start the connection process
connectDB().then(() => {
    // ONLY start the server once we are 100% connected
    app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`You better catch it! 🏃💨`);
    });
}).catch(err => {
    console.error("Failed to connect to MongoDB", err);
});

// we don't have event listeners in our application because fetch is a web API and not part of Node.js by default.
// we have no way of runnning fetch in our server.js file. Instead, we use fetch in our client-side JavaScript files that are served to the browser.
// the client side javascript files in our application are located in the public folder. However, we don't have any client-side JavaScript files in this particular application because all of our logic is handled on the server side using EJS templates to render HTML. This is called server-side rendering. It is not best practice for larger applications, but it is simpler for small applications like this one. If we wanted to add client-side JavaScript to this application, we could create a new file in the public folder and link to it in our EJS templates. Then we could use fetch and event listeners in that client-side JavaScript file. 
// for more complex applications, client-side rendering is often preferred because it allows for more dynamic and interactive user experiences.
// however, server-side rendering can be simpler to implement for small applications and can have performance benefits for initial page loads.