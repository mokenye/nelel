const passport = require("passport");
const validator = require("validator");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { validationResult } = require('express-validator');
const calculateNetIncome = require('../utils/taxCalculator');
const facts = require('../data/facts.json');
const allStates = require('../data/states.json');
const Groq = require("groq-sdk");

exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect("/profile");
  }
  res.render("login", {
    title: "Login",
  });
};

exports.getProfile = async (req, res, next) => {
    try {
        // 1. Gatekeeper
        if (req.user.income === undefined || req.user.age === undefined) {
            return res.redirect("/profile/edit");
        }
        // 2. Fetch Base Data
        const avgDoc = await User.aggregate([
            { $match: { income: { $gt: 0 } } },
            { $group: { _id: null, avgIncome: { $avg: "$income" } } }
        ]);
        const communityAverage = avgDoc && avgDoc[0] ? Math.round(avgDoc[0].avgIncome) : 0;
        // 3. Monthly Transaction Logic
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const transactions = await Transaction.find({ user: req.user.id }).lean();
        const monthlyTransactions = transactions.filter(t => t.date >= startOfMonth);
        const monthlyTotal = monthlyTransactions.reduce((acc, curr) => acc + curr.amount, 0);
        const monthlyIncome = req.user.monthlyNetIncome || 0;
        const targetSavings = monthlyIncome * (req.user.targetSavingsRate / 100);
        const actualSavings = monthlyIncome - monthlyTotal;
        const isOverBudget = actualSavings < targetSavings;
        const savingsShortfall = targetSavings - actualSavings;
        const hasTransactions = transactions.length > 0;

        // 4. Identify Top Category (Original Logic)
        const categoryTotals = monthlyTransactions.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {});
        const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
        const topCategoryName = topCategory ? topCategory[0] : null;
        const topCategoryAmount = topCategory ? topCategory[1] : 0;
        // Pick a Random Goal
        const userGoals = req.user.goals || [];
        const hasRealGoals = userGoals.length > 0; // Check if they actually have goals
        const fallbackGoal = { 
            name: "your future", 
            amount: 10000, 
            isPlaceholder: true  // <--- Add this flag
        };
        let coachGoalIndex = 0;
        let factGoalIndex = 0;
        if (userGoals.length > 1) {
          coachGoalIndex = Math.floor(Math.random() * userGoals.length);
          do {
              factGoalIndex = Math.floor(Math.random() * userGoals.length);
          } while (factGoalIndex === coachGoalIndex);
        }
        const coachGoal = hasRealGoals ? userGoals[coachGoalIndex] : fallbackGoal;
        if (!coachGoal.isPlaceholder) coachGoal.isPlaceholder = false; // Ensure even real goals get a false flag for consistency
        // Smart tip
        let smartTip = "";
        if (userGoals.length === 0 && transactions.length === 0) {
          smartTip = `
            Add a 
            <a href="/profile/edit" class="btn btn-link p-0 text-decoration-none fw-bold goal-link">
              goal <i class="bi bi-plus-lg"></i>
            </a>
            and start <a href="/tracker" class="btn btn-link p-0 text-decoration-none fw-bold goal-link">
              tracking <i class="bi bi-plus-lg"></i>
            </a> to unlock insights.
          `;
        }
        else if (userGoals.length === 0) {
            smartTip = `Almost there! Set a <a href="/profile/edit#goals-container" class="btn btn-link p-0 text-decoration-none fw-bold goal-link">
              goal <i class="bi bi-plus-lg"></i>
            </a> to see how today’s spending affects tomorrow.`;
        } 
        else if (transactions.length === 0) {
            smartTip = `Start logging purchases in the <a href="/tracker" class="btn btn-link p-0 text-decoration-none fw-bold goal-link">
              Tracker <i class="bi bi-plus-lg"></i>
            </a> to get tailored insights.`;
        } 
        else {
            const coachGoalName = coachGoal.name;
            if (isOverBudget) {
                const topWant = topCategoryName || "spending";
                smartTip = `You're short of your monthly savings target by <strong>$${Math.round(savingsShortfall).toLocaleString()}</strong>. High <strong>${topWant}</strong> costs are delaying your "${coachGoalName}" goal.`;
            } else {
                const surplus = Math.round(actualSavings - targetSavings);
                smartTip = `Exceeding your monthly savings target by <strong>$${surplus.toLocaleString()}</strong>! Adding this to your "${coachGoalName}" goal would be a massive win.`;
            }
          }

        // Daily Fact
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        let dailyFact;

        if (facts && facts.length > 0) {   // Use JSON if available, otherwise hit Groq
            dailyFact = facts[dayOfYear % facts.length];
        } else {
            try {
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); //
                const completion = await groq.chat.completions.create({
                    messages: [{ role: "user", content: "Short financial fun fact for today." }],
                    model: "llama-3.3-70b-versatile",
                });
                dailyFact = { fact: completion.choices[0].message.content };
            } catch (err) {
                dailyFact = { fact: "Savings is the first step to freedom." }; // Ultimate fallback
            }
        }
        //Cost of Living
        const userStateData = allStates.find(s => s.code === req.user.state) || { index: 100, name: "Unknown" };
        const benchmarkState = allStates.find(s => s.code === 'TX');
        const diff = (userStateData.index - benchmarkState.index) / userStateData.index;
        let initialGeoSaving = Math.round(coachGoal.amount * diff);

        // 7. Final Render
        return res.render("profile.ejs", { 
            user: req.user, 
            communityAverage, 
            monthlyTotal, 
            targetSavings, 
            actualSavings, 
            savingsShortfall, 
            isOverBudget, 
            topCategoryName, 
            topCategoryAmount,
            smartTip,
            dailyFact,
            allStates,
            userStateData,
            initialGeoSaving,
            coachGoal,
            hasTransactions
        });
    } catch (err) {
        console.error("getProfile error", err);
        return next(err);
    }
}

exports.getEditProfile = async (req, res) => {
  const states = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' }
  ];

  if (req.user) {
    return res.render("editProfile.ejs", { user: req.user, states: states });
  }
  res.redirect("/login");
}

exports.postEditProfile = async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
        return res.render("editProfile.ejs", { 
            user: { ...req.user._doc, ...req.body }, 
            states: allStates
        });
    }

  try {
    const { age, income, state, retirementAge, goalName, goalAmount, currentsavings, targetSavingsRate } = req.body;

    // 1. ZIP THE GOALS: Combine separate name/amount inputs into objects
    let goals = [];
    if (Array.isArray(goalName)) {
        goals = goalName.map((name, i) => ({
            name: name.trim(),
            amount: Number(goalAmount[i]) || 0
        })).filter(g => g.name !== ""); // Remove empty rows
    } else if (goalName) {
        // Handle single goal case (Express sends a string, not an array, if only one exists)
        goals = [{ name: goalName.trim(), amount: Number(goalAmount) || 0 }];
    }

    // 2. Perform Tax Calculations (using your utility)
    const updatedTaxData = calculateNetIncome(Number(income), state);

    // 3. Update User Document
    await User.findByIdAndUpdate(req.user.id, {
      age,
      income,
      state,
      retirementAge,
      currentsavings,
      targetSavingsRate,
      goals,
      monthlyNetIncome: updatedTaxData.monthlyNet,
      annualNetIncome: updatedTaxData.annualNet
    });

    res.redirect("/profile");
  } catch (err) {
    console.error("Error updating profile:", err);
    res.redirect("/profile/edit");
  }
};

exports.postLogin = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (validator.isEmpty(req.body.password))
    validationErrors.push({ msg: "Password cannot be blank." });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/login");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("errors", info);
      // save session before redirecting
      return req.session.save(() => {
        return res.redirect("/login");
      });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/profile");
    });
  })(req, res, next);
};

exports.logout = (req, res, next) => {
  console.log('logout start');
  req.logout((err) => {
    if (err) {
      console.error('logout error', err);
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('session destroy error', err);
        if (!res.headersSent) return res.redirect('/');
        return;
      }
      res.clearCookie('connect.sid');
      req.user = null;
      if (!res.headersSent) return res.redirect('/');
    });
  });
};

exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect("/profile");
  }
  res.render("signup", {
    title: "Create Account",
  });
};

exports.postSignup = async (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (!validator.isLength(req.body.password, { min: 8 }))
    validationErrors.push({
      msg: "Password must be at least 8 characters long",
    });
  if (req.body.password !== req.body.confirmPassword)
    validationErrors.push({ msg: "Passwords do not match" });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("../signup");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  const user = new User({
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
  });

  try {
    const existingUser = await User.findOne({$or: [
      {email: req.body.email},
      {userName: req.body.userName}
    ]}).lean()
    
    if (existingUser) {
      req.flash('errors', { msg: 'Account with that email address or username already exists.' })
      return res.redirect('../signup')
    }
    await user.save()
    
    req.logIn(user, (err) => {
    if (err) return next(err);
    req.flash("info", { msg: "Welcome! Let's start by setting up your profile details." }); // Set a welcome flash message for the new user
    return res.redirect("/profile/edit"); // Redirect new users to edit profile first
  });
  } catch (err) {
    return next(err)
  }
}

exports.getTracker = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).lean().sort({ date: -1 });
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyTotal = transactions
      .filter(t => t.date >= startOfMonth)
      .reduce((acc, curr) => acc + curr.amount, 0);
    const income = req.user.monthlyNetIncome || 1; // Avoid division by zero
    const spentPercentage = Math.min(monthlyTotal / income * 100, 100); // Cap at 100%
    let progressColor = "bg-success"; // under 70%
    if (spentPercentage >= 100) {
      progressColor = "bg-danger"; // 85% or more Critical
    } else if (spentPercentage > 70) {
      progressColor = "bg-warning"; // 70% or more Warning
    }
    return res.render("tracker.ejs", { user: req.user, transactions: transactions, monthlyTotal: monthlyTotal, spentPercentage: spentPercentage.toFixed(1), progressColor: progressColor });
  } catch (err) {
    console.error("getTracker error", err);
    if (res.headersSent) return;
    return next(err);
  }
}

exports.postTracker = async (req, res, next) => {
  try {
    const { name, amount, category } = req.body;
    // 1. Basic validation: Essential for security and DB health
    if (!name || !amount || !category) {
      req.flash('errors', { msg: 'Please fill in all fields.' });
      return res.redirect('/tracker');
    }
    const cleanName = name.trim();
    const cleanAmount = Number(amount);
    const oneMinuteAgo = new Date(Date.now() - 60000); // 1 minute window to check for duplicates
    const isDoubleClicked = await Transaction.findOne({
      user: req.user.id,
      name: { $regex: new RegExp(`^${cleanName}$`, 'i') }, // Case-insensitive
      amount: cleanAmount,
      date: { $gte: oneMinuteAgo }
    });
    if (isDoubleClicked) {
      req.flash("info", { msg: "This expense was just logged. Did you mean to add it again?" }); // Gentle nudge for potential double entry
      return req.session.save(() => res.redirect("/tracker"));
    }
    await Transaction.create({ // save to DB
      name: cleanName,
      amount: cleanAmount,
      category: category,
      user: req.user.id
    });
    req.flash("success", "Expense logged successfully!"); 
    res.redirect("/tracker");
  } catch (err) {
    console.error("Add Transaction Error:", err);
    res.redirect("/tracker");
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const transactionId = req.params.id;
    await Transaction.deleteOne({ _id: transactionId, user: req.user.id });
    console.log("Deleted Transaction");
    return res.redirect('/tracker');
  } catch (err) {
    console.error("deleteTransaction error", err);
    if (res.headersSent) return;
    return next(err);
  }
};