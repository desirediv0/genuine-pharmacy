import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";

const sendEmail = async (options) => {
  try {
    let transporter;

    const hasSmtpCreds = Boolean(
      process.env.SMTP_USER &&
      (process.env.SMTP_SERVICE || process.env.SMTP_HOST)
    );

    if (!hasSmtpCreds && process.env.NODE_ENV !== "production") {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.warn(
        "Using Ethereal test SMTP account for emails. Preview URLs will be logged."
      );
    } else {
      const port = Number(process.env.SMTP_PORT || 587);
      const secure = process.env.SMTP_SECURE
        ? String(process.env.SMTP_SECURE).toLowerCase() === "true"
        : port === 465;

      const transportConfig = process.env.SMTP_SERVICE
        ? {
          service: process.env.SMTP_SERVICE,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        }
        : {
          host: process.env.SMTP_HOST,
          port,
          secure,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        };

      transporter = nodemailer.createTransport(transportConfig);

      if (process.env.NODE_ENV !== "production") {
        try {
          await transporter.verify();
        } catch (verifyError) {
          console.error(
            "SMTP verification failed:",
            verifyError?.message || verifyError
          );
          throw new ApiError(500, "Email service not configured correctly");
        }
      }
    }

    const fromAddress = `${process.env.EMAIL_FROM_NAME || "GenuinePharmacy"
      } <${process.env.FROM_EMAIL || process.env.SMTP_USER || "no-reply@example.com"
      }>`;

    const mailOptions = {
      from: fromAddress,
      to: options.email,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV !== "production" && nodemailer.getTestMessageUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log("Email preview URL:", previewUrl);
      }
    }

    return info;
  } catch (error) {
    console.error("Email sending error:", error);
    throw new ApiError(500, "Failed to send email");
  }
};

export default sendEmail;
