const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Priority 1: Northflank Private Addon (MONGODB_URI)
    // Priority 2: Your Local/Atlas string (DB_STRING)
    const dbURI = process.env.NF_NELELMONGO_MONGO_SRV || process.env.MONGODB_URI || process.env.DB_STRING;

    const conn = await mongoose.connect(dbURI, {
      dbName: 'Nelel', // Matches the dbName in your session store
      // to specify database name, you can add { dbName: 'yourDatabaseName' } to the options object 
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("Could not connect to MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;