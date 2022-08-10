const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Firstname is required"],
      minlength: 3,
      index: true,
    },
    surname: {
      type: String,
      minlength: 3,
      required: [true, "surname is required"],
      index: true,
    },
    email: {
      type: String,
      index: true,
      required: [true, "Email is required"],
      unique: [true, "{VALUE} already exist in database, please login"],
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
    },
    mobile: {
      type: String,
      unique: [true, "{VALUE} already exist in database, please login"],
      minlength: [9, "the minimum length should more than 9 chars"],
      maxlength: [15, "the maximum length should less than 16 chars"],
    },
    password: {
      type: String,
      minlength: [6, "the password length should be greater than 6"],
      required: [true, "password is required"],
    },
    isVerify: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// encryption of user password before saving to mongodb
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//Export the model
module.exports = mongoose.model("User", userSchema);
