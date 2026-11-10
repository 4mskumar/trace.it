
import nodemailer from "nodemailer";

export async function sendVerificationEmail(
  email: string,
  verifyUrl: string
) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Ethereal email is only for development.");
  }

  const account = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });

  const info = await transporter.sendMail({
    from: `"Your Project" <${account.user}>`,
    to: email,
    subject: "Verify your email address",
    text: `Open this link to verify your account: ${verifyUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2>Verify your email</h2>
        <p>Click the button below to verify your account.</p>
        <p>
          <a href="${verifyUrl}"
             style="background:#2563eb;color:white;padding:12px 18px;
                    text-decoration:none;border-radius:6px;display:inline-block">
            Verify email address
          </a>
        </p>
        <p>This link expires in 30 minutes.</p>
      </div>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);

  console.log("Ethereal preview URL:", previewUrl);

  return previewUrl;
}
