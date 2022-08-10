const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASSWORD,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    return await transporter.sendMail({
        from: '"LIKDAM PET" <amoahtnt6@gmail.com>',
        to,
        subject,
        html,
      });
  } catch (error) {
    throw `Error found: ${error}`;
  }
};

module.exports = sendEmail;
