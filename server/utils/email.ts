import nodemailer from "nodemailer";

interface SendMailResult {
  sent: boolean;
  message: string;
}

/**
 * Sends a password reset email using nodemailer if SMTP credentials are set.
 * Otherwise, logs the reset URL to the terminal/console.
 */
export async function sendResetEmail(email: string, resetLink: string): Promise<SendMailResult> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";

  const isConfigured = !!(host && user && pass);

  const subject = "🔒 Vibe Yard Lounge - Mainframe Password Reset Request";
  const bodyText = `Greetings Administrator,\n\nA request has been initiated to reset the credentials for the Vibe Yard Lounge Mainframe.\n\nYou can reset your passphrase by navigating to the following clearance link:\n${resetLink}\n\nIf you did not initiate this system pathway, please ignore this request immediately.\n\nSecure perimeter logs, Vibe Yard Lounge.`;

  const bodyHtml = `
    <div style="font-family: 'Courier New', Courier, monospace; background-color: #030303; color: #e0e0e0; padding: 30px; border-radius: 12px; border: 1px solid #14b8a6; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; border-bottom: 2px solid #14b8a6; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #00f3ff; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Vibe Yard Lounge</h2>
        <span style="font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Admin Perimeter Authentication Hub</span>
      </div>
      
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        Greetings Administrator,
      </p>
      
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
        A clearance request has been received to reset the central credential cipher for the Vibe Yard Lounge Mainframe.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #d946ef; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 50px; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 2px; box-shadow: 0 0 15px rgba(217, 70, 239, 0.4); display: inline-block;">
          Authorize Passthrough Reset
        </a>
      </div>
      
      <p style="font-size: 12px; line-height: 1.6; color: #888; margin-bottom: 25px; word-break: break-all;">
        Or copy and paste this manual secure URL into your browser:<br/>
        <span style="color: #14b8a6;">${resetLink}</span>
      </p>
      
      <p style="font-size: 12px; line-height: 1.6; color: #ef4444; border-left: 2px solid #ef4444; padding-left: 10px; margin-bottom: 30px;">
        WARNING: This authorization link will expire in exactly 60 minutes. If you did not initiate this credential revision request, please ignore this transmission immediately.
      </p>
      
      <div style="font-size: 10px; color: #555; text-align: center; border-top: 1px solid #222; padding-top: 15px;">
        SYSTEM SECURE GATEWAY • ESTABLISHED 2026 • PORT: 3000
      </div>
    </div>
  `;

  if (isConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });

      await transporter.sendMail({
        from: `"Vibe Yard Mainframe" <${user}>`,
        to: email,
        subject,
        text: bodyText,
        html: bodyHtml,
      });

      console.log(`✉️ Password reset email successfully dispatched to ${email}`);
      return { sent: true, message: "Real email sent via SMTP successfully." };
    } catch (err) {
      console.error("❌ Failed to send reset email via SMTP:", err);
      // Fallback to console print on SMTP crash
    }
  }

  // Console Fallback Logging
  console.log("\n=======================================================");
  console.log("🔒 SYSTEM SECURE PASSING DEPLOYMENT INFO:");
  console.log(`Recipient: ${email}`);
  console.log("Subject:", subject);
  console.log(`Clearance Link:\n${resetLink}`);
  console.log("=======================================================\n");

  return {
    sent: false,
    message: "SMTP is not configured in environment variables. The password reset link was printed to the server terminal console for developer clearance.",
  };
}
