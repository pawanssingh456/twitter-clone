require("dotenv").config();
const mongoose = require("mongoose");

/**
 * Database class to connect to MongoDB database.
 */
class Database {
  /**
   * Constructor to create a new instance of the Database class.
   */
  constructor() {
    this.connect();
  }

  /**
   * Method to connect to the MongoDB database.
   */
  async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_CONNECTION_URL);
      console.log("Connected to the database.");
    } catch (err) {
      console.log("Error connecting to the database:", err);
    }
  }
}

module.exports = new Database();
