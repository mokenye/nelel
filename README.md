# Nelel – Personal Finance Companion

![Demo](./public/imgs/nelel.gif)

> A full-stack web application for tracking savings and spending with real-time insights. Built with modern web technologies and best practices for clean, maintainable code.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-brightgreen.svg)](https://www.mongodb.com)

## Features

- **Secure Authentication** – User registration and login with bcrypt password hashing
- **Transaction Tracking** – Log and categorize income and expenses with detailed records
- **Real-time Dashboard** – Visual overview of spending patterns and financial insights
- **Smart Tax Calculation** – Automated tax computation based on 2024 US tax brackets and state rates
- **User Profiles** – Customizable accounts with editable profile information and savings goals
- **Responsive Design** – Mobile-friendly interface built with Bootstrap
- **Session Management** – Persistent user sessions with MongoDB integration
- **AI Insights** – Personalized financial recommendations via Groq SDK

## Tech Stack

**Backend:**
- [Node.js](https://nodejs.org) – JavaScript runtime
- [Express.js](https://expressjs.com) – Web framework
- [MongoDB](https://www.mongodb.com) – NoSQL database
- [Mongoose](https://mongoosejs.com) – Object modeling and validation
- [Passport.js](http://www.passportjs.org) – Authentication middleware
- [Groq SDK](https://www.groq.com) – AI-powered insights

**Frontend:**
- [EJS](https://ejs.co) – Server-side templating
- HTML5 & CSS3 with [Bootstrap](https://getbootstrap.com) – Responsive UI

**Security & Tools:**
- [bcrypt](https://www.npmjs.com/package/bcrypt) – Password hashing
- [express-validator](https://express-validator.github.io) – Input validation
- [Morgan](https://www.npmjs.com/package/morgan) – HTTP logging

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/nelel.git
   cd nelel
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment configuration:**
   
   Create a `config/.env` file in your project root:
   ```env
   DB_STRING=mongodb+srv://username:password@cluster.mongodb.net/nelel
   PORT=2121
   SESSION_SECRET=your_session_secret_here
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Start the application:**
   
   **Development mode** (with auto-reload):
   ```bash
   npm run dev
   ```
   
   **Production mode:**
   ```bash
   npm start
   ```

5. **Open your browser:**
   Navigate to `http://localhost:2121`

## Project Structure

```
nelel/
├── config/           # Database and authentication configuration
│   ├── database.js   # MongoDB connection setup
│   └── passport.js   # Passport authentication strategies
├── controllers/      # Business logic and request handlers
│   ├── auth.js      # Authentication routes
│   └── home.js      # Home page logic
├── models/          # Mongoose database schemas
│   ├── User.js      # User schema
│   └── Transaction.js # Transaction schema
├── routes/          # Express route definitions
│   └── main.js      # Main application routes
├── middleware/      # Custom Express middleware
│   └── auth.js      # Authentication middleware
├── views/           # EJS templates for UI rendering
│   ├── index.ejs
│   ├── profile.ejs
│   ├── tracker.ejs
│   └── partials/    # Reusable template components
├── public/          # Static assets
│   ├── css/
│   └── imgs/
├── utils/           # Utility functions
│   └── taxCalculator.js
├── data/            # Seed data
│   └── states.json
├── server.js        # Express app initialization
└── package.json     # Project dependencies
```

## Usage

### Creating an Account
1. Navigate to the sign-up page
2. Enter your email and password
3. Your account is created and you're automatically logged in

### Tracking Transactions
1. Go to the tracker dashboard
2. Add a new transaction (income or expense)
3. View your transaction history and financial summary
4. Edit or delete transactions as needed

### Managing Your Profile
1. Visit your profile page
2. Update personal information and savings goals
3. View your transaction statistics and net income calculations

## Development

### Running Tests
```bash
npm test
```

### Code Style
- Follows Node.js best practices
- MVC architectural pattern for clean separation of concerns
- Modular routing and controller logic for maintainability

### Adding New Features
1. Create a new controller in `controllers/`
2. Define routes in `routes/main.js`
3. Create EJS templates in `views/`
4. Update models if needed in `models/`

## Deployment

### Northflank (Recommended)

Northflank provides free tier hosting with no cold starts—your server stays always-on.

#### Option 1: GitHub Deployment (Recommended)

1. **Connect GitHub account:**
   - Go to [Northflank Dashboard](https://northflank.com/)
   - Click **Create Project** → **GitHub**
   - Authorize Northflank and select your repository

2. **Configure deployment:**
   - **Build command:** `npm install`
   - **Start command:** `node server.js`
   - **Port:** `2121`
   - **Node version:** `18`

3. **Set environment variables:**
   In Northflank dashboard, go to **Secrets** and add:
   ```
   DB_STRING=mongodb+srv://username:password@cluster.mongodb.net/nelel
   SESSION_SECRET=your_generated_secret_here
   GROQ_API_KEY=your_groq_api_key
   PORT=2121
   ```

4. **Deploy:**
   - Push to main branch
   - Northflank automatically builds and deploys
   - Access your live app at the provided domain

#### Option 2: Docker Image

1. **Create Dockerfile** in project root:
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --production
   COPY . .
   
   EXPOSE 2121
   CMD ["node", "server.js"]
   ```

2. **Build and push to Docker Hub:**
   ```bash
   docker build -t your-username/nelel:latest .
   docker push your-username/nelel:latest
   ```

3. **In Northflank dashboard:**
   - Create new service
   - Select **Docker Registry**
   - Paste image: `your-username/nelel:latest`
   - Set environment variables
   - Deploy

### Limitations & Future Improvements

**Current Limitations:**
- Single-user only (no multi-user/family accounts)
- Fixed transaction categories (no custom categories)
- Monthly dashboard only (no historical trend analysis)
- No data export (CSV/PDF)
- US tax rates only (2024 brackets)
- No recurring transactions
- No 2FA or OAuth login

**Planned Enhancements:**
- Recurring/scheduled transactions
- Transaction history export
- Monthly/yearly spending trends
- Custom user categories
- Two-factor authentication (2FA)
- Budget alerts and enforcement
- Dark mode

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** and commit (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

Please ensure your code follows the existing style and includes appropriate comments.

## License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

## Support & Questions

- Open an issue for bug reports
- Check existing issues before creating new ones
- Include steps to reproduce for bugs

## Acknowledgments

Built with passion for personal finance management. Special thanks to the open-source community for the amazing tools and libraries. 