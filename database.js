const mongoose = require("mongoose");

class Database {
  constructor() {
    this.connect();
  }

  connect() {
    mongoose
      .connect(
        "mongodb+srv://pawansingh:5fVBbcnlc2mfAC2Z@twitter-clone.tht1vy0.mongodb.net/?retryWrites=true&w=majority"
      )
      .then(() => {
        console.log("connected to db");
      })
      .catch((err) => {
        console.log("error in connection", err);
      });
  }
}

module.exports = new Database();
