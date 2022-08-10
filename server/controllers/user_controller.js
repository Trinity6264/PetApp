const AsyncWrapper = require("../middleware/async_wrapper");
const userSchema = require("../models/user_model");
const sendEmailVerification = require("../utils/send_email_verification");
const TokenModel = require("../models/token_model");
const passwordDecryption = require("../middleware/password_encryption");
const { CustomError } = require("../error/custom_error");

// Create a new user
const createUser = AsyncWrapper(async (req, res) => {
  const { email } = req.body;
  const rep = await userSchema.findOne({ email });
  if (rep) {
    throw new CustomError("Email already exist, please login", 404);
  }
  const response = await new userSchema(req.body).save();
  if (!response) {
    return res.status(401).json({
      msg: response,
      status: false,
      data: {},
    });
  }

  // this will be our token
  const token = Date.now();
  await new TokenModel({
    token: token,
    email: response.email,
  }).save();

  await sendEmailVerification({
    email: response.email,
    name: response.surname,
    origin: "http://192.168.43.7:3000/api/v1/user/",
    token: token,
  });

  return res.status(201).json({
    msg: "User account created, Please check your email to verify your account.",
    status: true,
    data: {},
  });
});

// confirm account through the mail sent to the client email address

const verifyEmail = AsyncWrapper(async (req, res) => {
  const { token, email } = req.query;

  // fecthing user data from the user collection
  const tokenAuth = await TokenModel.find({ email });
  if (!tokenAuth) {
    throw new CustomError("server route not found", 404);
  }
  const confirmToken = tokenAuth[0].token === token;
  console.log(confirmToken);
  if (confirmToken) {
    const user = await userSchema.findOneAndUpdate(
      { email },
      { isVerify: true }
    );
    if (!user) {
      throw new CustomError("session not found", 401);
    }
    await TokenModel.findOneAndRemove({ email });
    res.json({
      status: true,
      msg: "Email confirmation completed, login",
      data: {},
    });
    return;
  } else {
    throw new CustomError("session not found", 401);
  }
});

// login a user
const loginUser = AsyncWrapper(async (req, res) => {
  const { email, mobile, password } = req.body;

  if (!mobile && !email) {
    throw new CustomError("Provide account email or mobile number", 401);
  }
  if (email && !email.includes("@")) {
    throw new CustomError("Provide a valid email address", 401);
  }
  if (password.length < 6) {
    throw new CustomError("Password length must be more than 5 chars", 401);
  }
  if (mobile && mobile.length < 6) {
    throw new CustomError(
      "Mobile number length must be more than 9 chars",
      401
    );
  }

  const response = await userSchema.findOne({
    $or: [{ email }, { mobile }],
  });
  if (!response) {
    throw new CustomError("Invalid credentials provided", 404);
  }
  if (!response.isVerify) {
    throw new CustomError("Please confirm your email", 401);
  }

  // verify password by decrypting the hash text in the database
  //? if it matches it will return true otherwise false
  const passwordVerify = await passwordDecryption(password, response.password);
  if (!passwordVerify) {
    throw new CustomError(
      "Wrong password,please check and enter the correct password",
      401
    );
  }
  res.status(202).json({
    status: false,
    msg: "Data found",
    data: {
      id: response.id,
      firstname: response.firstname,
      surnname: response.surname,
      email: response.email,
      mobile: response.mobile || "",
      joinedAt: response.createdAt,
    },
  });
});
// delete  user
const deleteUser = AsyncWrapper(async (req, res) => {
  console.log(req.params);
  const { id } = req.params;
  if (!id) {
    throw new CustomError("Id provided was not found", 404);
  }
  const response = await userSchema.findByIdAndDelete(id);
  if (!response) {
    throw new CustomError("data does not exist", 401);
  }
  res.status(200).send({
    status: false,
    msg: "Data deleted successfully",
    data: {},
  });
});
// update  user
const updateUser = AsyncWrapper(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new CustomError("Id provided was not found", 404);
  }
  const response = await userSchema.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!response) {
    throw new CustomError(response, 404);
  }
  res.status(200).send({
    status: false,
    msg: "user data updated successfully",
    data: {
      id: response.id,
      firstname: response.firstname,
      surnname: response.surname,
      email: response.email,
      mobile: response.mobile || "",
      joinedAt: response.createdAt,
    },
  });
});

// find all usersdoc
const getdocs = AsyncWrapper(async (req, res) => {
  // the select method will select the fields from
  // the docs instead of fetching all the fields in the docs
  // and if the fields doesn't exist, it will ignore it.
  const docs = await userSchema
    .find()
    .select("firstname surname email mobile isVerify");
  res.status(200).json({
    status: true,
    msg: "data found",
    data: [...docs],
  });
});
// find one doc
const getdoc = AsyncWrapper(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  if (!id) {
    return res.status(400).json({
      status: false,
      msg: "doc id is required",
      data: {},
    });
  }
  const docs = await userSchema
    .findById(id)
    .select("firstname surname email mobile isVerify");
  if (!docs) {
    return res.status(404).json({
      status: true,
      msg: `No data found with the given id`,
      data: {},
    });
  }
  res.status(200).json({
    status: true,
    msg: "data found",
    data: docs,
  });
});

const searchUser = AsyncWrapper(async (req, res) => {
  const { email, mobile, firstname } = req.body;
  const response = await userSchema.findOne({
    $or: [
      { email },
      { mobile },
      { firstname: { $regex: firstname || "", $options: "i" } },
    ],
  });
  if (!response) {
    throw new CustomError("Data not found", 404);
  }
  res.status(200).json({
    status: true,
    msg: "data found",
    data: response,
  });
});
module.exports = {
  createUser,
  loginUser,
  deleteUser,
  updateUser,
  getdocs,
  getdoc,
  searchUser,
  verifyEmail,
};
