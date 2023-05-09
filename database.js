const mongoose = require("mongoose");

class Database {
  constructor() {
    this.connect();
  }

  connect() {
    mongoose
      .connect(process.env.MONGODB_CONNECTION_URL)
      .then(() => {
        console.log("connected to db");
      })
      .catch((err) => {
        console.log("error in connection", err);
      });
  }
}

module.exports = new Database();
