function buildOtpEmailHtml(otp: string): string {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JalVayu AI - Verification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0F172A 0%, #0D9488 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 28px;">JalVayu AI</h1>
    <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Monsoon Preparedness Verification</p>
  </div>
  <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
    <h2 style="color: #333; margin-bottom: 20px;">Hello!</h2>
    <p style="color: #666; margin-bottom: 30px;">
      You've requested secure access to your monsoon preparedness dashboard. Use the verification code below.
    </p>
    <div style="background: white; border: 2px dashed #0D9488; border-radius: 10px; padding: 20px; margin: 30px 0;">
      <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Your verification code is:</p>
      <div style="font-size: 36px; font-weight: bold; color: #0D9488; letter-spacing: 8px; font-family: 'Courier New', monospace;">
        ${otp}
      </div>
    </div>
    <p style="color: #999; font-size: 12px; margin-top: 30px;">
      This code will expire in 5 minutes. If you didn't request this code, please ignore this email.
    </p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="color: #999; font-size: 12px; margin: 0;">© ${year} JalVayu AI. All rights reserved.</p>
  </div>
</body>
</html>`;
}

function buildOtpEmailText(otp: string): string {
  const year = new Date().getFullYear();

  return `JalVayu AI - Verification

Hello!

You've requested secure access to your monsoon preparedness dashboard. Your verification code is: ${otp}

This code will expire in 5 minutes.

© ${year} JalVayu AI. All rights reserved.`;
}

type SendEmailOtpInput = {
  email: string;
  otp: string;
};

export async function sendEmailOtp({
  email,
  otp,
}: SendEmailOtpInput): Promise<void> {
  const subject = "JalVayu AI - Verification Code";
  const html = buildOtpEmailHtml(otp);
  const text = buildOtpEmailText(otp);

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@ai.rohanbhoi.in",
      to: email,
      subject,
      text,
      html,
    });

    return;
  }

  console.log("[email-otp] SMTP not configured — OTP logged for development");
  console.log("OTP for", email, "is", otp);
  console.log("Subject:", subject);
}
