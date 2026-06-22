require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GOOGLE_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error) => {
  if (error) {
    console.error("Mail Server Error:", error);
  } else {
    console.log("Mail Server Connected Successfully");
  }
});

// Function to send email

const sendBookingEmail = async (email, name, title) => {
  try {
    const info = await transporter.sendMail({
      from: `"Eventora" <${process.env.GOOGLE_USER}>`,

      to: email,

      subject: `Booking Confirmed - ${title}`,

      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2>Booking Confirmed</h2>

          <p>Hello ${name},</p>

          <p>
            Your booking for
            <strong>${title}</strong>
            has been confirmed successfully.
          </p>

          <p>
            Thank you for choosing Eventora.
          </p>
        </div>
      `,
    });

    console.log("Booking Email Sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("Booking Email Error:", error);

    throw error;
  }
};

const sendOtpEmail = async (email, name, otp, type) => {
  try {
    const title =
      type === "account_verification"
        ? "Account Verification OTP"
        : "Event Booking OTP";

    const msg =
      type === "account_verification"
        ? "Use this OTP to verify your account."
        : "Use this OTP to verify your booking.";

    const info = await transporter.sendMail({
      from: `"Eventora" <${process.env.GOOGLE_USER}>`,

      to: email,

      subject: title,

      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2>${title}</h2>

          <p>Hello ${name},</p>

          <p>${msg}</p>

          <div
            style="
              font-size:32px;
              font-weight:bold;
              margin:20px 0;
            "
          >
            ${otp}
          </div>

          <p>
            This OTP is valid for
            10 minutes.
          </p>
        </div>
      `,
    });

    console.log(`OTP Email Sent To ${email}`);

    return info;
  } catch (error) {
    console.error("OTP Email Error:", error);

    throw error;
  }
};

module.exports = {
  sendOtpEmail,
  sendBookingEmail,
};
