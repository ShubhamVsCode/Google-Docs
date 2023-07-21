const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  documents: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "document",
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
