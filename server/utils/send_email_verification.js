const sendEmail = require("../backend/middleware/email_sender");

const sendVerificationEmail = async ({ name, email, token, origin }) => {
  const verifyEmail = `${origin}/verify-email?token=${token}&email=${email}`;

  const message = `<p>Please confirm your email by clicking on the following link: 
  <a href="${verifyEmail}">Verify Email</a> </p>`;

  return sendEmail({
    to: email,
    subject: "Email Confirmation",
    html: `<h4> Hello ${name},</h4> ${message}`,
  });
};


module.exports = sendVerificationEmail