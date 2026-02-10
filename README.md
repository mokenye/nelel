# Nelel

This is a web application built using Node.js, Express, and EJS, following the Model-View-Controller (MVC) architectural pattern. It includes user authentication and interacts with a database.

## 🌟 Key Features
- User Authentication (Sign Up, Log In, Log Out)
- Database Integration
- Dynamic Content Rendering using EJS
- Static Asset Serving
- Modular Routing and Controller Logic

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Frontend:** EJS (Embedded JavaScript Templates), HTML, CSS & Bootstrap, JavaScript
- **Authentication:** Passport.js
- **Deployment:** Northflank || Vercel for serverless

## 🚀 Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com...

2. **Install dependencies:**
   ```bash
   npm install

3. **Environment setup:**
   ```env
   DB_STRING=your_mongodb_uri
   PORT=2121

4. **Run the app:**
   ```bash
   npm start

## 📂 Project Structure
- config/: Configuration files.
- controllers/: Logic for handling requests and interacting with models.
- data/: Seed data files (json).
- middleware/: Custom Express middleware.
- models/: Database schemas (e.g., User).
- public/: Static assets (CSS, Images).
- routes/: URL routing for the application.
- utils/: Utility functions.
- views/: EJS templates for the frontend. 